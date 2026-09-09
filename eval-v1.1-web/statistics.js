export function calculateStatistics(cases) {
  const total = cases.length;
  const correct = cases.filter(c => c.judgment === '正确').length;
  const error = total - correct;
  const avg = total ? +(cases.reduce((a,c)=>a+c.scores.total_100,0)/total).toFixed(1) : 0;
  const high = cases.filter(c => c.high_severity === '是').length;
  const scenes = [...new Set(cases.map(c=>c.risk_scene))].map(name=>{
    const rows = cases.filter(c=>c.risk_scene===name);
    return {name,count:rows.length,correct:rows.filter(c=>c.judgment==='正确').length,error:rows.filter(c=>c.judgment==='错误').length,avg:+(rows.reduce((a,c)=>a+c.scores.total_100,0)/rows.length).toFixed(1),high_severity:rows.filter(c=>c.high_severity==='是').length};
  });
  return {total_cases:total,correct,error,average_score:avg,high_severity_count:high,error_rate:total?+(error/total).toFixed(3):0,formula:'六项原始分 ÷ 120 × 100',scenes};
}
