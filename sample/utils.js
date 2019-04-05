export function compareEpochs(a, b) {
  if (a.epochs < b.epochs)
    return -1;
  if (a.epochs > b.epochs)
    return 1;

  return 0;
}

export function logDataValues(data) {
  const maxEpochs = Math.max(...data.map(o => o.epochs), 0);
  const maxXPE = Math.max(...data.map(o => o.HPE), 0);
  const maxYPL = Math.max(...data.map(o => o.HPL), 0);
  const totalEpochs = data.reduce((a, b) => {
    return a + b.epochs;
  }, 0);

  // eslint-disable-next-line no-console
  console.log(`generating graph with ${data.length} points`);
  // eslint-disable-next-line no-console
  console.log(`totalEpochs: ${totalEpochs}, maxEpochs: ${maxEpochs}, maxHPE: ${maxXPE}, maxHPL: ${maxYPL}`);
}
