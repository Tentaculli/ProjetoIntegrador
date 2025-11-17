using API.Models;
using API.Models.Enums;
using API.Models.Order;
using API.Models.Client;
using Microsoft.EntityFrameworkCore;

namespace API.Data
{
    public class AppDbContext: DbContext
    {
        public AppDbContext(DbContextOptions options) : base(options) {}

        public DbSet<Shape> Shapes { get; set; } = null!;
        public DbSet<Order> Orders { get; set; } = null!;
        public DbSet<Client> Clients { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Shapes
            modelBuilder.Entity<Shape>()
                .Property(s => s.Type)
                .HasConversion<string>();

            // Orders
            modelBuilder.Entity<Order>()
                .Property(o => o.Id)
                .ValueGeneratedOnAdd();
            
            modelBuilder.Entity<Order>()
                .Property(o => o.Created)
                .HasDefaultValueSql("CURRENT_TIMESTAMP(6)");
            
            modelBuilder.Entity<Order>()
                .Property(o => o.ShapePos1)
                .HasConversion<string>();
            
            modelBuilder.Entity<Order>()
                .Property(o => o.ShapePos2)
                .HasConversion<string>();
            
            modelBuilder.Entity<Order>()
                .Property(o => o.ShapePos3)
                .HasConversion<string>();
            
            modelBuilder.Entity<Order>()
                .Property(o => o.Status)
                .HasConversion<string>();
        }
    }
}