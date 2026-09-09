export function validateDataset(dataset) {
  const errors = [];
  if (!dataset || typeof dataset !== 'object') return ['dataset不是对象'];
  if (dataset.meta?.case_count !== 50) errors.push(`meta.case_count 应为50，当前为 ${dataset.meta?.case_count}`);
  if (!Array.isArray(dataset.cases) || dataset.cases.length !== 50) errors.push(`cases 应有50条，当前为 ${dataset.cases?.length ?? 0}`);
  const ids = new Set();
  for (const c of dataset.cases || []) {
    if (!/^QC\d{3}$/.test(c.id)) errors.push(`${c.id || '未知'}: ID格式错误`);
    if (ids.has(c.id)) errors.push(`${c.id}: ID重复`); ids.add(c.id);
    const s = c.scores || {};
    const raw = ['classification','risk','evidence','boundary','human','resolution'].reduce((a,k)=>a+(Number(s[k])||0),0);
    const total = Math.round(raw / 120 * 100 * 10) / 10;
    if (raw !== s.raw_total) errors.push(`${c.id}: 原始总分不一致，应为${raw}`);
    if (total !== s.total_100) errors.push(`${c.id}: 百分制得分不一致，应为${total}`);
    const expected = total < 75 || c.high_severity === '是' ? '错误' : '正确';
    if (expected !== c.judgment) errors.push(`${c.id}: 判定不一致，应为${expected}`);
    for (const k of ['classification','risk','evidence','boundary','human','resolution']) if (s[k] < 0 || s[k] > 20) errors.push(`${c.id}: ${k}分值越界`);
  }
  return errors;
}

export async function validateByJsonSchema(dataset) {
  // 浏览器端不内置第三方JSON Schema引擎；本函数提供与项目规则一致的轻量校验。
  return validateDataset(dataset);
}
