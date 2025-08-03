using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BirthdayTracker.Migrations
{
    /// <inheritdoc />
    public partial class BirthdayToLong : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<long>(
                name: "BirthDay",
                table: "Users",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(DateOnly),
                oldType: "TEXT");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<DateOnly>(
                name: "BirthDay",
                table: "Users",
                type: "TEXT",
                nullable: false,
                oldClrType: typeof(long),
                oldType: "INTEGER");
        }
    }
}
