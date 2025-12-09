using API.Models.Enums;
using API.Models.Order;
using API.Models.Client;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace API.Data
{
    public class AppDbContext: DbContext
    {
        public AppDbContext(DbContextOptions options) : base(options) {}

        public DbSet<Order> Orders { get; set; } = null!;
        public DbSet<Client> Clients { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Orders
            modelBuilder.Entity<Order>()
                .Property(o => o.Id)
                .ValueGeneratedOnAdd();
            
            modelBuilder.Entity<Order>()
                .Property(o => o.Created)
                .HasDefaultValueSql("CURRENT_TIMESTAMP(6)");
            
            modelBuilder.Entity<Order>()
                .Property(o => o.Pin1Pos1)
                .HasConversion<string>();
            
            modelBuilder.Entity<Order>()
                .Property(o => o.Pin1Pos2)
                .HasConversion<string>();
            
            modelBuilder.Entity<Order>()
                .Property(o => o.Pin1Pos3)
                .HasConversion<string>();

            modelBuilder.Entity<Order>()
                .Property(o => o.Pin2Pos1)
                .HasConversion<string>();
            
            modelBuilder.Entity<Order>()
                .Property(o => o.Pin2Pos2)
                .HasConversion<string>();
            
            modelBuilder.Entity<Order>()
                .Property(o => o.Pin2Pos3)
                .HasConversion<string>();
            
            modelBuilder.Entity<Order>()
                .Property(o => o.Status)
                .HasConversion<string>();

            modelBuilder.Entity<Order>()
                .Property(o => o.StatusByPosition)
                .HasConversion<int>();

            modelBuilder.Entity<Order>()
                .HasOne(o => o.Client)
                .WithMany()
                .HasForeignKey(o => o.ClientId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }

    public partial class ForceRecreateClientForeignKey : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Remove a FK antiga se existir
            migrationBuilder.Sql(@"
                SET @fk_name = (
                    SELECT CONSTRAINT_NAME 
                    FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
                    WHERE TABLE_SCHEMA = 'Tentaculli' 
                    AND TABLE_NAME = 'Orders' 
                    AND COLUMN_NAME = 'ClientId'
                    AND REFERENCED_TABLE_NAME IS NOT NULL
                    LIMIT 1
                );
                
                SET @sql = IF(@fk_name IS NOT NULL, 
                    CONCAT('ALTER TABLE Orders DROP FOREIGN KEY ', @fk_name), 
                    'SELECT ''No FK to drop''');
                
                PREPARE stmt FROM @sql;
                EXECUTE stmt;
                DEALLOCATE PREPARE stmt;
            ");

            // Recria com CASCADE
            migrationBuilder.AddForeignKey(
                name: "FK_Orders_Clients_ClientId",
                table: "Orders",
                column: "ClientId",
                principalTable: "Clients",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Orders_Clients_ClientId",
                table: "Orders");

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_Clients_ClientId",
                table: "Orders",
                column: "ClientId",
                principalTable: "Clients",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}