const User = require("tests/orm/setup/user.model");
const Usuario = require("tests/orm/setup/usuario.model");

describe("Default properties", () => {
  test("Validating the properties configured by default", () => {
    expect(User.getTableName).toBe("`users`");
    expect(User.getPrimaryKey).toBe("id");
    expect(User.getIncrementing).toBe(true);
    expect(User.getKeyType).toBe("int");
    expect(User.getTimestamps).toBe(true);
    expect(User.getDateFormat).toBe("TIMESTAMP");
    expect(User.getCreatedAt).toBe("created_at");
    expect(User.getUpdatedAt).toBe("updated_at");
    expect(User.getTimezone).toBe(null);
    expect(User.getConnection).toBe("default");
    expect(User.getLogicalDeleted).toBe(false);
    expect(User.getDeleted).toBe("deleted");
    expect(User.getDeletedAt).toBe("deleted_at");
    expect(User.getDeletedBy).toBe("deleted_by");
    expect(typeof User.getCasts).toBe("object");
    expect(Object.entries(User.getCasts).length).toBe(3);
  });

  test("Validating the custom properties", () => {
    expect(Usuario.getTableName).toBe("`usuarios`");
    expect(Usuario.getPrimaryKey).toBe("user_id");
    expect(Usuario.getIncrementing).toBe(false);
    expect(Usuario.getKeyType).toBe("string");
    expect(Usuario.getTimestamps).toBe(false);
    expect(Usuario.getDateFormat).toBe("DD-MM-YYYY HH:mm:ss");
    expect(Usuario.getCreatedAt).toBe("creado");
    expect(Usuario.getUpdatedAt).toBe("actualizado");
    expect(Usuario.getTimezone).toBe("America/Los_Angeles");
    expect(Usuario.getConnection).toBe("test");
    expect(Usuario.getLogicalDeleted).toBe(true);
    expect(Usuario.getDeleted).toBe("eliminado");
    expect(Usuario.getDeletedAt).toBe("fecha_eliminado");
    expect(Usuario.getDeletedBy).toBe("eliminado_por");
    expect(typeof Usuario.getCasts).toBe("object");
    expect(Object.entries(Usuario.getCasts).length).toBe(0);
  });
});
