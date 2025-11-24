using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace API.Migrations
{
    /// <inheritdoc />
    public partial class ModifiedOrdersTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "ShapePos3",
                table: "Orders",
                newName: "Pin2Pos3");

            migrationBuilder.RenameColumn(
                name: "ShapePos2",
                table: "Orders",
                newName: "Pin2Pos2");

            migrationBuilder.RenameColumn(
                name: "ShapePos1",
                table: "Orders",
                newName: "Pin2Pos1");

            migrationBuilder.AddColumn<string>(
                name: "Pin1Pos1",
                table: "Orders",
                type: "longtext",
                nullable: false)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "Pin1Pos2",
                table: "Orders",
                type: "longtext",
                nullable: false)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "Pin1Pos3",
                table: "Orders",
                type: "longtext",
                nullable: false)
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Pin1Pos1",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "Pin1Pos2",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "Pin1Pos3",
                table: "Orders");

            migrationBuilder.RenameColumn(
                name: "Pin2Pos3",
                table: "Orders",
                newName: "ShapePos3");

            migrationBuilder.RenameColumn(
                name: "Pin2Pos2",
                table: "Orders",
                newName: "ShapePos2");

            migrationBuilder.RenameColumn(
                name: "Pin2Pos1",
                table: "Orders",
                newName: "ShapePos1");
        }
    }
}
