/**
 * Statistics calculation functions for AI Customer Service Evaluation Set
 * Handles all statistical computations for the evaluation dataset
 */

export function calculateStatistics(cases) {
  if (!cases || cases.length === 0) {
    return {
      total_cases: 0,
      correct: 0,
      error: 0,
      average_score: 0,
      high_severity_count: 0,
      error_rate: 0,
      scenes: []
    };
  }

  const total_cases = cases.length;
  const correct = cases.filter(c => c.judgment === '正确').length;
  const error = cases.filter(c => c.judgment === '错误').length;
  const high_severity_count = cases.filter(c => c.high_severity === '是').length;
  
  // Calculate average score
  const totalScore = cases.reduce((sum, c) => sum + (c.scores?.total_100 || 0), 0);
  const average_score = cases.length > 0 ? Math.round((totalScore / cases.length) * 10) / 10 : 0;
  
  // Calculate error rate
  const error_rate = cases.length > 0 ? error / cases.length : 0;

  // Calculate scenes statistics
  const sceneMap = {};
  cases.forEach(c => {
    const scene = c.risk_scene || 'Unknown';
    if (!sceneMap[scene]) {
      sceneMap[scene] = { count: 0, correct: 0, error: 0, scores: [], high_severity: 0 };
    }
    sceneMap[scene].count++;
    if (c.judgment === '正确') sceneMap[scene].correct++;
    if (c.judgment === '错误') sceneMap[scene].error++;
    if (c.high_severity === '是') sceneMap[scene].high_severity++;
    if (c.scores?.total_100) sceneMap[scene].scores.push(c.scores.total_100);
  });

  const scenes = Object.entries(sceneMap).map(([name, data]) => ({
    name,
    count: data.count,
    correct: data.correct,
    error: data.error,
    avg: data.scores.length > 0 ? Math.round((data.scores.reduce((a, b) => a + b, 0) / data.scores.length) * 10) / 10 : 0,
    high_severity: data.high_severity
  }));

  return {
    total_cases,
    correct,
    error,
    average_score,
    high_severity_count,
    error_rate,
    scenes
  };
}
