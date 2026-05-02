type PlaceholderPageProps = {
  name: string;
};

export function PlaceholderPage({ name }: PlaceholderPageProps) {
  return (
    <section className="flex min-h-[calc(100vh-9rem)] items-center justify-center px-4 py-8">
      <div className="w-full rounded-md border bg-expo-white p-6 text-center">
        <p className="text-sm font-medium uppercase text-primary-medium">
          Placeholder
        </p>
        <h2 className="mt-2 text-xl font-bold text-primary">{name}</h2>
      </div>
    </section>
  );
}
