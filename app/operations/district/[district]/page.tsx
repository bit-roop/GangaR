import { OperationPageShell } from "@/components/operations/OperationPageShell";

type DistrictPageProps = {
  params: Promise<{ district: string }>;
};

export default async function DistrictOperationsPage({ params }: DistrictPageProps) {
  const { district } = await params;

  return (
    <OperationPageShell
      title={`${district.replace(/-/g, " ")} District Operations`}
      subtitle="Dedicated district coordination workflows will be expanded here in a later phase."
    />
  );
}
