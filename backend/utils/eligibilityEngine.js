const { normalizeSkill } = require('./scoringEngine');

/**
 * Check eligibility of candidate for a given job
 */
const checkEligibility = (candidateData = {}, jobData = {}) => {
  const reasons = [];
  let passedCount = 0;
  let totalChecks = 0;

  // 1. Education check
  totalChecks++;
  const candidateEducation = Array.isArray(candidateData.education) ? candidateData.education : [];
  const reqQual = jobData.qualification || "Bachelor's Degree";
  const hasDegree = candidateEducation.length > 0;
  const isMasterReq = /master|m\.?tech|m\.?s|phd/i.test(reqQual);
  const candidateHasMaster = candidateEducation.some(e => /master|m\.?tech|m\.?s|m\.?c\.?a|mba/i.test(e.degree || ''));

  if (isMasterReq) {
    if (candidateHasMaster) {
      reasons.push(`✓ Required Education: Master's degree requirement satisfied`);
      passedCount++;
    } else {
      reasons.push(`✗ Education Mismatch: Job requires Master's degree (Candidate has Bachelor's/Undergrad)`);
    }
  } else {
    if (hasDegree) {
      reasons.push(`✓ Required Education: ${reqQual} satisfied (${candidateEducation[0]?.degree || 'Degree verified'})`);
      passedCount++;
    } else {
      reasons.push(`✗ Education: Required qualification '${reqQual}' not found in profile`);
    }
  }

  // 2. Experience check
  totalChecks++;
  const reqExp = jobData.experienceRequired || 0;
  let candidateYears = 0;
  if (Array.isArray(candidateData.experience)) {
    candidateYears = candidateData.experience.reduce((sum, item) => sum + (item.years || 1), 0);
  } else if (typeof candidateData.experienceYears === 'number') {
    candidateYears = candidateData.experienceYears;
  }

  if (candidateYears >= reqExp) {
    reasons.push(`✓ Experience Level: Meets or exceeds requirement (${candidateYears}+ years vs ${reqExp} required)`);
    passedCount++;
  } else if (candidateYears > 0 && candidateYears >= reqExp - 1) {
    reasons.push(`~ Experience Level: Partially meets (${candidateYears} yrs vs ${reqExp} yrs required)`);
    passedCount += 0.5;
  } else {
    reasons.push(`✗ Experience Level: Requires ${reqExp}+ years experience (Profile indicates ${candidateYears} years)`);
  }

  // 3. Required skills verification
  const candidateSkills = (candidateData.skills || []).map(normalizeSkill);
  const requiredSkills = jobData.requiredSkills || [];

  if (requiredSkills.length > 0) {
    totalChecks++;
    let matchedSkillsCount = 0;
    const keyMatched = [];
    const keyMissing = [];

    requiredSkills.forEach(skill => {
      if (candidateSkills.includes(normalizeSkill(skill))) {
        matchedSkillsCount++;
        keyMatched.push(skill);
      } else {
        keyMissing.push(skill);
      }
    });

    const skillRatio = matchedSkillsCount / requiredSkills.length;
    if (skillRatio >= 0.70) {
      reasons.push(`✓ Core Skills: Strong match (${matchedSkillsCount}/${requiredSkills.length} skills: ${keyMatched.slice(0, 3).join(', ')})`);
      passedCount++;
    } else if (skillRatio >= 0.35) {
      reasons.push(`~ Core Skills: Partial match (${matchedSkillsCount}/${requiredSkills.length} skills). Missing: ${keyMissing.slice(0, 3).join(', ')}`);
      passedCount += 0.5;
    } else {
      reasons.push(`✗ Core Skills: Significant gaps. Missing critical skills: ${keyMissing.slice(0, 3).join(', ')}`);
    }
  }

  // Determine final status
  let status = 'Eligible';
  const ratio = passedCount / totalChecks;

  if (ratio >= 0.8) {
    status = 'Eligible';
  } else if (ratio >= 0.4) {
    status = 'Partially Eligible';
  } else {
    status = 'Not Eligible';
  }

  return {
    status,
    ratio: Math.round(ratio * 100),
    reasons,
  };
};

module.exports = { checkEligibility };
