import { Request } from 'express';

export * from './base-filter';
export * from './userDataToken.decorator';
export * from './pagination.decorator';

// export function QueryBuilder(req: Request) {
//   let filter = { ...req.query };
//   for (const key in filter) {
//     const value = filter[key] as string;
//     if (!value.trim()) delete filter[key];
//   }
//   const dateRange = req['dateRange'];
//   let search = filter['search'] as string;
//   if (search) {
//     search = search
//       .trim()
//       .replace(/  +/g, ' ')
//       .replace(
//         /[^a-zA-Z0-9ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂẾưăạảấầẩẫậắằẳẵặẹẻẽềềểếỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ_-\s]/g,
//         '',
//       );
//     filter = { ...filter, name: { $regex: search, $options: 'i' } };
//   }
//   if (dateRange) {
//     let dateFilter = {};
//     if (dateRange['start']) dateFilter = { $gte: dateRange['start'] };
//     if (dateRange['end'])
//       dateFilter = { ...dateFilter, $lte: dateRange['end'] };
//     if (Object.keys(dateFilter).length > 0) {
//       if (filter['findScenario'] == '1')
//         filter = { ...filter, scenarioStartTime: dateFilter };
//       else filter = { ...filter, createdAt: dateFilter };
//     }
//   }
//   delete filter['startDate'];
//   delete filter['endDate'];
//   delete filter['search'];
//   delete filter['findScenario'];
//   delete filter['startTimeType'];
//   return filter;
// }
