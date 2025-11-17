using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace API.Migrations
{
    /// <inheritdoc />
    public partial class AddOrdersTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Renomeia Tentaculli para Shapes se a tabela Tentaculli existir
            migrationBuilder.Sql(@"
                DROP PROCEDURE IF EXISTS RenameTableIfExists;
                
                CREATE PROCEDURE RenameTableIfExists()
                BEGIN
                    IF EXISTS (
                        SELECT * FROM information_schema.tables 
                        WHERE table_schema = 'Tentaculli' 
                        AND table_name = 'Tentaculli'
                    ) THEN
                        RENAME TABLE `Tentaculli` TO `Shapes`;
                    END IF;
                END;
                
                CALL RenameTableIfExists();
                
                DROP PROCEDURE RenameTableIfExists;
            ");

            migrationBuilder.CreateTable(
                name: "Orders",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    ShapePos1 = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ShapePos2 = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ShapePos3 = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Created = table.Column<DateTime>(type: "datetime(6)", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP(6)")
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.ComputedColumn),
                    Status = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Orders", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Orders");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Shapes",
                table: "Shapes");

            migrationBuilder.RenameTable(
                name: "Shapes",
                newName: "Tentaculli");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Tentaculli",
                table: "Tentaculli",
                column: "Id");
        }
    }
}
