const advancedResults = (model, options = {}) => async (req, res, next) => {
  const reqQuery = { ...req.query };
  const removeFields = ['select', 'sort', 'page', 'limit'];
  removeFields.forEach((param) => delete reqQuery[param]);

  const sanitizedQuery = {};
  if (options.allowedFilters) {
    for (const key of Object.keys(reqQuery)) {
      if (options.allowedFilters.includes(key)) {
        sanitizedQuery[key] = reqQuery[key];
      }
    }
  } else {
    Object.assign(sanitizedQuery, reqQuery);
  }

  let queryStr = JSON.stringify(sanitizedQuery);
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, (match) => `$${match}`);

  let query = model.find(JSON.parse(queryStr));

  // Select Fields
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const defaultLimit = 10;
  const maxLimit = options.maxLimit || Infinity;
  const limit = Math.min(parseInt(req.query.limit, 10) || defaultLimit, maxLimit);
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await model.countDocuments();

  query = query.skip(startIndex).limit(limit);

  const results = await query;

  const pagination = {};
  if (endIndex < total) {
    pagination.next = { page: page + 1, limit };
  }
  if (startIndex > 0) {
    pagination.prev = { page: page - 1, limit };
  }

  res.advancedResults = {
    count: results.length,
    pagination,
    data: results,
  };

  next();
};

module.exports = advancedResults;
