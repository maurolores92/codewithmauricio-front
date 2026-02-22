import CustomChip from "src/@core/components/mui/chip";

const STATUS_MAP: Record<string, { label: string; color: "success" | "error" | "warning" }> = {
  active: { label: "Activo", color: "success" },
  deactivated: { label: "Borrado", color: "error" },
  "no-published": { label: "No Publicado", color: "warning" }
};

type Props = {
  status: string;
};

const ProductStatusChip: React.FC<Props> = ({ status }) => {
  const config = STATUS_MAP[status] || { label: status, color: "default" };

  return <CustomChip label={config.label} skin="light" color={config.color as any}  />;
};

export default ProductStatusChip;
