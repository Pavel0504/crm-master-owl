import { useState } from "react";
import { Modal, Input, Select, Button, DatePicker } from "../ui";
import { MaterialCategory } from "../../services/materialCategoryService";
import { MaterialInput } from "../../services/materialService";
import { Supplier } from "../../services/supplierService";

interface CreateMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MaterialInput) => Promise<void>;
  categories: MaterialCategory[];
  suppliers: Supplier[];
  loading?: boolean;
}

export default function CreateMaterialModal({
  isOpen,
  onClose,
  onSubmit,
  categories,
  suppliers,
  loading = false,
}: CreateMaterialModalProps) {
  const [formData, setFormData] = useState<MaterialInput>({
    name: "",
    category_id: null,
    supplier: "",
    delivery_method: "",
    purchase_price: 0,
    initial_volume: 0,
    remaining_volume: 0,
    purchase_date: new Date().toISOString().split("T")[0],
    unit_of_measurement: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const dataToSubmit = {
      ...formData,
      remaining_volume: formData.initial_volume,
    };
    await onSubmit(dataToSubmit);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      name: "",
      category_id: null,
      supplier: "",
      delivery_method: "",
      purchase_price: 0,
      initial_volume: 0,
      remaining_volume: 0,
      purchase_date: new Date().toISOString().split("T")[0],
      unit_of_measurement: "",
    });
    onClose();
  };

  const categoryOptions = [
    { value: "", label: "Без категории" },
    ...categories.map((cat) => ({
      value: cat.id,
      label: cat.name,
    })),
  ];

  const supplierOptions = [
    { value: "", label: "Без поставщика" },
    ...suppliers.map((sup) => ({
      value: sup.id,
      label: `${sup.name} (${sup.delivery_method})`,
    })),
  ];

  const handleSupplierChange = (supplierId: string) => {
    if (!supplierId) {
      setFormData({ ...formData, supplier: "", delivery_method: "" });
      return;
    }

    const selectedSupplier = suppliers.find((sup) => sup.id === supplierId);
    if (selectedSupplier) {
      setFormData({
        ...formData,
        supplier: selectedSupplier.name,
        delivery_method: selectedSupplier.delivery_method,
      });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Добавить материал"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Название материала"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            placeholder="Например: Шерстяная пряжа"
          />

          <Select
            label="Категория"
            value={formData.category_id || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                category_id: e.target.value || null,
              })
            }
            options={categoryOptions}
          />

          <Select
            label="Поставщик"
            value={
              suppliers.find((s) => s.name === formData.supplier)?.id || ""
            }
            onChange={(e) => handleSupplierChange(e.target.value)}
            options={supplierOptions}
          />

          <Input
            label="Цена закупки (руб.)"
            type="text"
            inputMode="decimal"
            pattern="[0-9]*[.,]?[0-9]*"
            value={formData.purchase_price}
            onChange={(e) =>
              setFormData({
                ...formData,
                purchase_price: parseFloat(e.target.value) || 0,
              })
            }
            required
          />

          <Input
            label="Начальный объем"
            type="text"
            inputMode="decimal"
            pattern="[0-9]*[.,]?[0-9]*"
            value={formData.initial_volume}
            onChange={(e) =>
              setFormData({
                ...formData,
                initial_volume: parseFloat(e.target.value) || 0,
              })
            }
            required
          />

          <Input
            label="Единица измерения"
            value={formData.unit_of_measurement}
            onChange={(e) =>
              setFormData({ ...formData, unit_of_measurement: e.target.value })
            }
            placeholder="Например: кг, м, шт"
            required
          />

          <DatePicker
            label="Дата закупки"
            value={formData.purchase_date || ""}
            onChange={(value) =>
              setFormData({ ...formData, purchase_date: value })
            }
            required
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            fullWidth
            disabled={loading}
          >
            Отмена
          </Button>
          <Button type="submit" variant="primary" fullWidth loading={loading}>
            Добавить
          </Button>
        </div>
      </form>
    </Modal>
  );
}
