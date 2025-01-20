import { ReactNode } from "react";

type item = string;

type ListProps = {
  items: item[];
  className?: string;
};

export function List({ items, className = "pl-2" }: ListProps) {
  return (
    <CustomList className={className}>
      {items?.map((item) => {
        return <ListItem key={item.substring(0, 50)}>{item}</ListItem>;
      })}
    </CustomList>
  );
}

export function CustomList({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <ul className={`list-none ${className} flex flex-col gap-2`}>{children}</ul>
  );
}

export function ListItem({ children }: { children?: string | ReactNode }) {
  return (
    <li className="flex items-start">
      <div className="relative text-2xl">
        <div className="absolute top-[-4px]">•</div>
      </div>
      <div className="pl-5">{children}</div>
    </li>
  );
}
