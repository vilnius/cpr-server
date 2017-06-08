var DEFAULT_PER_PAGE = 12;

export function PaginatedResponse(req, res, model, sorting) {
  var perPage = parseInt(req.query.perPage);
  var page = parseInt(req.query.page);

  perPage = isNaN(perPage) ? DEFAULT_PER_PAGE : perPage;
  page = isNaN(page) ? 1 : page;

  model.find({})
    .limit(perPage)
    .skip(perPage*(page-1))
    .sort(sorting)
    .exec((err, data) => {
      if (err) {
        return res.status(400).json({ error: err.toString() });
      }
      model.count().exec((err, count) => {
        var response = {
          pagination: {
            page,
            perPage,
            total: count,
            pages: Math.ceil(count/perPage)
          },
          objects: data
        }
        return res.json(response);
      });
    });
};
