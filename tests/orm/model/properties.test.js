const User = require("tests/orm/setup/user.model");
const Usuario = require("tests/orm/setup/usuario.model");

describe("Default properties", () => {
  test("Validating the properties configured by default", () => {
    expect(User.getTableName).toBe("`users`");
    expect(User.primaryKey).toBe("id");
    expect(User.incrementing).toBe(true);
    expect(User.keyType).toBe("int");
    expect(User.timestamps).toBe(true);
    expect(User.dateFormat).toBe("TIMESTAMP");
    expect(User.createdAt).toBe("created_at");
    expect(User.updatedAt).toBe("updated_at");
    expect(User.timezone).toBe(null);
    expect(User.connection).toBe("default");
    expect(User.logicalDelete).toBe(false);
    expect(User.deleted).toBe("deleted");
    expect(User.deletedAt).toBe("deleted_at");
    expect(User.deletedBy).toBe("deleted_by");
    expect(typeof User.casts).toBe("object");
    expect(Object.entries(User.casts).length).toBe(3);
  });

  test("Validating the custom properties", () => {
    expect(Usuario.getTableName).toBe("`usuarios`");
    expect(Usuario.primaryKey).toBe("user_id");
    expect(Usuario.incrementing).toBe(false);
    expect(Usuario.keyType).toBe("string");
    expect(Usuario.timestamps).toBe(false);
    expect(Usuario.dateFormat).toBe("DD-MM-YYYY HH:mm:ss");
    expect(Usuario.createdAt).toBe("creado");
    expect(Usuario.updatedAt).toBe("actualizado");
    expect(Usuario.timezone).toBe("America/Los_Angeles");
    expect(Usuario.connection).toBe("test");
    expect(Usuario.logicalDelete).toBe(true);
    expect(Usuario.deleted).toBe("eliminado");
    expect(Usuario.deletedAt).toBe("fecha_eliminado");
    expect(Usuario.deletedBy).toBe("eliminado_por");
    expect(typeof Usuario.casts).toBe("object");
    expect(Object.entries(Usuario.casts).length).toBe(0);
  });
});
