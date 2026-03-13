interface Props {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

export default function DashboardCard({ title, value, icon, color }: Props) {
  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-xl p-5 flex items-center justify-between hover:shadow-lg transition">

      <div>
        <p className="text-white-500 text-sm">{title}</p>
        <h2 className="text-2xl font-bold">{value}</h2>
      </div>

      <div className={`${color} text-white p-3 rounded-lg text-xl`}>
        {icon}
      </div>

    </div>
  );
}