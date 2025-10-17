// Utility for moving an item in week structure
export function moveItemInWeek(week, fromDay, fromIdx, toDay, toIdx=null){
  // week: array of { day, items: [...] }
  // remove item
  if(!Array.isArray(week)) throw new Error('week must be array');
  if(fromDay<0 || fromDay>=week.length) throw new Error('fromDay out of range');
  const itemsFrom = week[fromDay].items || [];
  if(fromIdx<0 || fromIdx>=itemsFrom.length) throw new Error('fromIdx out of range');
  const item = itemsFrom.splice(fromIdx,1)[0];
  // ensure toDay exists
  if(toDay<0) toDay = 0;
  if(toDay >= week.length){
    // append to end (create placeholder day if needed)
    while(week.length <= toDay) week.push({day: 'Day'+week.length, items: []});
  }
  const itemsTo = week[toDay].items || (week[toDay].items = []);
  if(toIdx === null || toIdx === undefined || toIdx > itemsTo.length) toIdx = itemsTo.length;
  itemsTo.splice(toIdx, 0, item);
  return week;
}
