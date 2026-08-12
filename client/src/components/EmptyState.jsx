export default function EmptyState({ message = 'No data available' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-gray-500">
      <p>{message}</p>
    </div>
  );
}
