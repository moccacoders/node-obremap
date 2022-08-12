const Model = require("orm/model").default;

describe("Validate model structure", () => {
  test("Model is a Model Object", () => {
    expect(Model.constructor.name).toBe("Function");
    expect(Model.name).toBe("Model");
  });

  test("Model has methods", () => {
    expect(Model.sql.name).toBe("sql");
    expect(Model.all.name).toBe("all");
    expect(Model.first.name).toBe("first");
    expect(Model.last.name).toBe("last");
    expect(Model.count.name).toBe("count");
    expect(Model.max.name).toBe("max");
    expect(Model.min.name).toBe("min");
    expect(Model.sum.name).toBe("sum");
    expect(Model.avg.name).toBe("avg");
    expect(Model.average.name).toBe("average");
    expect(Model.get.name).toBe("get");
    expect(Model.toSql.name).toBe("toSql");
    expect(Model.insertToSql.name).toBe("insertToSql");
    expect(Model.updateToSql.name).toBe("updateToSql");
    expect(Model.deleteToSql.name).toBe("deleteToSql");
    expect(Model.truncateToSql.name).toBe("truncateToSql");
    expect(Model.find.name).toBe("find");
    expect(Model.value.name).toBe("value");
    expect(Model.paginate.name).toBe("paginate");
    expect(Model.implode.name).toBe("implode");
    expect(Model.exists.name).toBe("exists");
    expect(Model.doesntExist.name).toBe("doesntExist");
    expect(Model.update.name).toBe("update");
    expect(Model.insert.name).toBe("insert");
    expect(Model.delete.name).toBe("_delete");
    expect(Model.truncate.name).toBe("truncate");
    expect(Model.table.name).toBe("table");
    expect(Model.setTimestamps.name).toBe("setTimestamps");
    expect(Model.setCreatedAt.name).toBe("setCreatedAt");
    expect(Model.setUpdatedAt.name).toBe("setUpdatedAt");
    expect(Model.select.name).toBe("select");
    expect(Model.where.name).toBe("where");
    expect(Model.orWhere.name).toBe("orWhere");
    expect(Model.whereIn.name).toBe("whereIn");
    expect(Model.orWhereIn.name).toBe("orWhereIn");
    expect(Model.whereNotIn.name).toBe("whereNotIn");
    expect(Model.orWhereNotIn.name).toBe("orWhereNotIn");
    expect(Model.whereNull.name).toBe("whereNull");
    expect(Model.orWhereNull.name).toBe("orWhereNull");
    expect(Model.whereNotNull.name).toBe("whereNotNull");
    expect(Model.orWhereNotNull.name).toBe("orWhereNotNull");
    expect(Model.whereBetween.name).toBe("whereBetween");
    expect(Model.orWhereBetween.name).toBe("orWhereBetween");
    expect(Model.whereNotBetween.name).toBe("whereNotBetween");
    expect(Model.orWhereNotBetween.name).toBe("orWhereNotBetween");
    expect(Model.whereJsonContains.name).toBe("whereJsonContains");
    expect(Model.orWhereJsonContains.name).toBe("orWhereJsonContains");
    expect(Model.whereJsonDoesntContains.name).toBe("whereJsonDoesntContains");
    expect(Model.orWhereJsonDoesntContains.name).toBe(
      "orWhereJsonDoesntContains"
    );
    expect(Model.whereJsonLength.name).toBe("whereJsonLength");
    expect(Model.orWhereJsonLength.name).toBe("orWhereJsonLength");
    expect(Model.orderBy.name).toBe("orderBy");
    expect(Model.latest.name).toBe("latest");
    expect(Model.oldest.name).toBe("oldest");
    expect(Model.reorder.name).toBe("reorder");
    expect(Model.groupBy.name).toBe("groupBy");
    expect(Model.offset.name).toBe("offset");
    expect(Model.skip.name).toBe("skip");
    expect(Model.limit.name).toBe("limit");
    expect(Model.take.name).toBe("take");
    expect(Model.forPage.name).toBe("forPage");
    expect(Model.set.name).toBe("set");
    expect(Model.logicalDeleted.name).toBe("logicalDeleted");
    expect(Model.join.name).toBe("join");
    expect(Model.leftJoin.name).toBe("leftJoin");
    expect(Model.rightJoin.name).toBe("rightJoin");
    expect(Model.crossJoin.name).toBe("crossJoin");
  });

  test("Model has properties", () => {
    expect(Model.getTableName.constructor.name).toBe("String");
    expect(Model.getTimestamps.constructor.name).toBe("Boolean");
    expect(Model.getCreatedAt.constructor.name).toBe("String");
    expect(Model.getUpdatedAt.constructor.name).toBe("String");
    expect(Model.getLogicalDeleted.constructor.name).toBe("Boolean");
    expect(Model.snakeCase.constructor.name).toBe("Boolean");
    expect(Model.tableName).toBeNull();
    expect(Model.primaryKey.constructor.name).toBe("String");
    expect(Model.incrementing.constructor.name).toBe("Boolean");
    expect(Model.keyType.constructor.name).toBe("String");
    expect(Model.timestamps.constructor.name).toBe("Boolean");
    expect(Model.dateFormat.constructor.name).toBe("String");
    expect(Model.createdAt.constructor.name).toBe("String");
    expect(Model.updatedAt.constructor.name).toBe("String");
    expect(Model.timezone).toBeNull();
    expect(Model.connection.constructor.name).toBe("String");
    expect(Model.logicalDelete.constructor.name).toBe("Boolean");
    expect(Model.deleted.constructor.name).toBe("String");
    expect(Model.deletedAt.constructor.name).toBe("String");
    expect(Model.deletedBy.constructor.name).toBe("String");
    expect(Model.casts.constructor.name).toBe("Object");
    expect(Model.getTimezone.constructor.name).toBe("String");
    expect(Model.currentDate.constructor.name).toBe("String");
  });

  test("Model return a query builder", async () => {
    const select = Model.select(1);
    const orderBy = Model.orderBy(1);
    const groupBy = Model.groupBy(1);
    const where = Model.where(1);
    const orWhere = Model.orWhere(1);
    const limit = Model.limit(1);
    const offset = Model.offset(1);
    const join = Model.join("table", "field");
    const set = Model.set(1);

    expect(select.builder).toBeTruthy();
    expect(orderBy.builder).toBeTruthy();
    expect(groupBy.builder).toBeTruthy();
    expect(where.builder).toBeTruthy();
    expect(orWhere.builder).toBeTruthy();
    expect(limit.builder).toBeTruthy();
    expect(offset.builder).toBeTruthy();
    expect(join.builder).toBeTruthy();
    expect(set.builder).toBeTruthy();
  });
});
