class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    //1)FILTERING
    //a new object contains every key value pairs
    let queryObj = { ...this.queryString };
    const excludedFields = ["page", "sort", "limit", "fields"];
    //clean the query first and then execute the query because we use await so only result can be sent back and impossible to sort or pagination again
    excludedFields.forEach((el) => delete queryObj[el]);

    //2)ADVANCED FILTERING
    let queryStr = JSON.stringify(queryObj);
    //regular expression
    //exact words:\b b\, multiple times:g

    //original queryStr:  //{ difficulty: 'easy', duration: { gte: '3' } }
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    queryObj = JSON.parse(queryStr);

    //EXECUTE QUERY
    //this return a query
    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    //3)SORTING
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }

  //4)FIELD LIMITING
  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      //not include __v
      this.query = this.query.select("-__v");
    }
    return this;
  }

  //5)PAGINATION
  paginate() {
    //page=2&limit=10, 1-10,page 1; 11-20, page 2
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = APIFeatures;
