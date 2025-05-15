import { Link } from "wouter";
import { Category } from "@shared/schema";

interface CategoryCardProps {
  category: Category;
}

const getCategoryColor = (name: string) => {
  switch (name.toLowerCase()) {
    case 'puzzle':
      return {
        bg: 'bg-secondary/20',
        hover: 'hover:bg-secondary/20',
        iconBg: 'bg-secondary/10',
        text: 'text-secondary'
      };
    case 'adventure':
      return {
        bg: 'bg-primary/20',
        hover: 'hover:bg-primary/20',
        iconBg: 'bg-primary/10',
        text: 'text-primary'
      };
    default:
      return {
        bg: 'bg-accent/20',
        hover: 'hover:bg-accent/20',
        iconBg: 'bg-accent/10',
        text: 'text-accent'
      };
  }
};

const CategoryCard = ({ category }: CategoryCardProps) => {
  const colors = getCategoryColor(category.name);
  
  return (
    <Link href={`/games?categoryId=${category.id}`}>
      <a className={`bg-card-light rounded-xl p-4 text-center transition hover:scale-105 cursor-pointer ${colors.hover}`}>
        <div className={`${colors.iconBg} inline-flex p-3 rounded-full mb-3`}>
          <i className={`${category.icon} text-2xl ${colors.text}`}></i>
        </div>
        <h3 className="font-medium text-white">{category.name}</h3>
      </a>
    </Link>
  );
};

export default CategoryCard;
