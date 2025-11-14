using API.Models;
using Microsoft.EntityFrameworkCore;

namespace API.Data
{
    public class AppDbContext: DbContext
    {
        public AppDbContext(DbContextOptions options) : base(options) {}

        public DbSet<Shape> Tentaculli { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Salva ENUM como texto no banco
            modelBuilder.Entity<Shape>()
                .Property(s => s.Type)
                .HasConversion<string>();
        }
    }
}