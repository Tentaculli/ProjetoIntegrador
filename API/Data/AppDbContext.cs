using API.Models.Enums;
using API.Models.Order;
using API.Models.Client;
using Microsoft.EntityFrameworkCore;

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
                .HasOne(o => o.Client)
                .WithMany()
                .HasForeignKey(o => o.ClientId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}