import * as Knex from "knex";

exports.up = async function (knex: Knex): Promise<any> {
    return knex.schema.createTable("project_user", table => {
        table.integer("project_id").references("project.id");
        table.integer("user_id").references("user.id");
        table.primary(["project_id", "user_id"]);
    });
};

exports.down = async function (knex: Knex): Promise<any> {
    return knex.schema.dropTable("project_user");
};
