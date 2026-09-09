/**
 * Dataset validation functions for AI Customer Service Evaluation Set
 * Validates data structure, scoring logic, and compliance rules
 */

export function validateDataset(dataset) {
  const errors = [];

  if (!dataset) {
    errors.push('Dataset is null or undefined');
    return errors;
  }

  // Validate meta section
  if (!dataset.meta) {
    errors.push('Missing meta section');
  } else {
    if (dataset.meta.case_count !== 50) {
      errors.push(`Expected 50 cases, but meta declares ${dataset.meta.case_count}`);
    }
  }

  // Validate cases array
  if (!Array.isArray(dataset.cases)) {
    errors.push('Cases must be an array');
    return errors;
  }

  if (dataset.cases.length !== 50) {
    errors.push(`Expected 50 cases, found ${dataset.cases.length}`);
  }

  // Validate each case
  dataset.cases.forEach((c, index) => {
    const caseNum = index + 1;

    // Check required fields
    if (!c.id) errors.push(`Case ${caseNum}: Missing ID`);
    if (!c.user_question) errors.push(`Case ${caseNum} (${c.id}): Missing user_question`);
    if (!c.ai_answer) errors.push(`Case ${caseNum} (${c.id}): Missing ai_answer`);
    if (!c.standard_answer) errors.push(`Case ${caseNum} (${c.id}): Missing standard_answer`);
    if (!c.judgment) errors.push(`Case ${caseNum} (${c.id}): Missing judgment`);
    if (c.high_severity === undefined) errors.push(`Case ${caseNum} (${c.id}): Missing high_severity`);

    // Validate judgment values
    if (c.judgment && !["正确", "错误"].includes(c.judgment)) {
      errors.push(`Case ${caseNum} (${c.id}): Invalid judgment value: ${c.judgment}`);
    }

    // Validate high_severity values
    if (c.high_severity && !["是", "否"].includes(c.high_severity)) {
      errors.push(`Case ${caseNum} (${c.id}): Invalid high_severity value: ${c.high_severity}`);
    }

    // Validate scoring
    if (!c.scores) {
      errors.push(`Case ${caseNum} (${c.id}): Missing scores object`);
    } else {
      const requiredScoreFields = ['classification', 'risk', 'evidence', 'boundary', 'human', 'resolution', 'raw_total', 'total_100'];
      requiredScoreFields.forEach(field => {
        if (c.scores[field] === undefined) {
          errors.push(`Case ${caseNum} (${c.id}): Missing score field: ${field}`);
        }
      });

      // Validate score calculation
      if (c.scores.raw_total !== undefined && c.scores.total_100 !== undefined) {
        const calculated = Math.round((c.scores.raw_total / 120) * 100 * 10) / 10;
        if (calculated !== c.scores.total_100) {
          errors.push(`Case ${caseNum} (${c.id}): Score mismatch. Expected ${calculated}%, got ${c.scores.total_100}%`);
        }
      }

      // Validate decision logic
      if (c.judgment === '错误') {
        const isScoreLow = c.scores.total_100 < 75;
        const isHighSeverity = c.high_severity === '是';
        if (!isScoreLow && !isHighSeverity) {
          errors.push(`Case ${caseNum} (${c.id}): Judgment is '错误' but score >= 75 and high_severity != '是'`);
        }
      }
    }
  });

  // Validate knowledge base
  if (Array.isArray(dataset.knowledge_base)) {
    dataset.knowledge_base.forEach((kb, index) => {
      if (!kb.id) errors.push(`Knowledge base ${index}: Missing ID`);
      if (!kb.name) errors.push(`Knowledge base ${index}: Missing name`);
      if (!kb.core) errors.push(`Knowledge base ${index}: Missing core`);
      if (!kb.source_type) errors.push(`Knowledge base ${index}: Missing source_type`);
    });
  }

  return errors;
}

/**
 * Validate dataset against JSON Schema
 * @param {Object} dataset - The evaluation dataset
 * @param {Object} schema - JSON Schema object (optional)
 * @returns {Array} Array of validation error messages
 */
export function validateByJsonSchema(dataset, schema) {
  const errors = [];
  // Basic schema validation (simplified version)
  // A full implementation would require ajv or similar library
  
  if (!schema) {
    return ['No schema provided'];
  }

  if (schema.required) {
    schema.required.forEach(field => {
      if (!(field in dataset)) {
        errors.push(`Missing required field: ${field}`);
      }
    });
  }

  return errors;
}
