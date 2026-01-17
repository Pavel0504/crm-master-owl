import { useState, useEffect } from 'react';
import { Store, Edit2, Check, X, Plus, Trash2, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getOrCreateShop, updateShop, Shop as ShopType } from '../services/shopService';
import { Card, Input, Button, IconButton } from '../components/ui';

interface EditingField {
  field: string;
  value: string;
}

export default function Shop() {
  const { user } = useAuth();
  const [shop, setShop] = useState<ShopType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<EditingField | null>(null);
  const [saving, setSaving] = useState(false);

  const [socialNetworks, setSocialNetworks] = useState<Array<{ key: string; value: string }>>([]);
  const [editingSocials, setEditingSocials] = useState(false);

  useEffect(() => {
    loadShop();
  }, [user]);

  useEffect(() => {
    if (shop?.social_networks) {
      const entries = Object.entries(shop.social_networks).map(([key, value]) => ({
        key,
        value,
      }));
      setSocialNetworks(entries.length > 0 ? entries : [{ key: '', value: '' }]);
    }
  }, [shop]);

  const loadShop = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await getOrCreateShop(user.id);

    if (fetchError) {
      setError('Не удалось загрузить данные магазина');
    } else {
      setShop(data);
    }

    setLoading(false);
  };

  const startEditing = (field: string, value: string) => {
    setEditingField({ field, value });
  };

  const cancelEditing = () => {
    setEditingField(null);
  };

  const saveField = async () => {
    if (!editingField || !shop) return;

    setSaving(true);
    const { data, error: updateError } = await updateShop(shop.id, {
      [editingField.field]: editingField.value,
    });

    if (updateError) {
      setError('Не удалось сохранить изменения');
    } else if (data) {
      setShop(data);
      setEditingField(null);
    }

    setSaving(false);
  };

  const startEditingSocials = () => {
    setEditingSocials(true);
  };

  const cancelEditingSocials = () => {
    if (shop?.social_networks) {
      const entries = Object.entries(shop.social_networks).map(([key, value]) => ({
        key,
        value,
      }));
      setSocialNetworks(entries.length > 0 ? entries : [{ key: '', value: '' }]);
    }
    setEditingSocials(false);
  };

  const saveSocialNetworks = async () => {
    if (!shop) return;

    const socialObject: Record<string, string> = {};
    socialNetworks.forEach((item) => {
      if (item.key.trim() && item.value.trim()) {
        socialObject[item.key.trim()] = item.value.trim();
      }
    });

    setSaving(true);
    const { data, error: updateError } = await updateShop(shop.id, {
      social_networks: socialObject,
    });

    if (updateError) {
      setError('Не удалось сохранить социальные сети');
    } else if (data) {
      setShop(data);
      setEditingSocials(false);
    }

    setSaving(false);
  };

  const addSocialNetwork = () => {
    setSocialNetworks([...socialNetworks, { key: '', value: '' }]);
  };

  const removeSocialNetwork = (index: number) => {
    setSocialNetworks(socialNetworks.filter((_, i) => i !== index));
  };

  const updateSocialNetwork = (index: number, field: 'key' | 'value', value: string) => {
    const updated = [...socialNetworks];
    updated[index][field] = value;
    setSocialNetworks(updated);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <Card variant="elevated">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500 dark:text-burgundy-400" />
          </div>
        </Card>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="max-w-7xl mx-auto">
        <Card variant="elevated">
          <p className="text-red-600 dark:text-red-400">Не удалось загрузить данные магазина</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-rose-400 dark:from-burgundy-600 dark:to-burgundy-700 rounded-xl flex items-center justify-center">
            <Store className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Магазин</h1>
            <p className="text-gray-600 dark:text-gray-400">Настройки вашего магазина</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <EditableField
            label="Название магазина"
            value={shop.name}
            field="name"
            editingField={editingField}
            onStartEdit={startEditing}
            onCancel={cancelEditing}
            onSave={saveField}
            onChange={(value) => setEditingField({ ...editingField!, value })}
            saving={saving}
          />

          <EditableField
            label="Категория"
            value={shop.category}
            field="category"
            editingField={editingField}
            onStartEdit={startEditing}
            onCancel={cancelEditing}
            onSave={saveField}
            onChange={(value) => setEditingField({ ...editingField!, value })}
            saving={saving}
          />

          <EditableField
            label="Владелец"
            value={shop.owner}
            field="owner"
            editingField={editingField}
            onStartEdit={startEditing}
            onCancel={cancelEditing}
            onSave={saveField}
            onChange={(value) => setEditingField({ ...editingField!, value })}
            saving={saving}
          />

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Социальные сети
              </label>
              {!editingSocials && (
                <IconButton
                  icon={<Edit2 />}
                  size="sm"
                  variant="ghost"
                  onClick={startEditingSocials}
                />
              )}
            </div>

            {editingSocials ? (
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 space-y-3">
                  {socialNetworks.map((item, index) => (
                    <div key={index} className="flex gap-3">
                      <Input
                        placeholder="Название (например, Instagram)"
                        value={item.key}
                        onChange={(e) => updateSocialNetwork(index, 'key', e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        placeholder="Ссылка или username"
                        value={item.value}
                        onChange={(e) => updateSocialNetwork(index, 'value', e.target.value)}
                        className="flex-1"
                      />
                      {socialNetworks.length > 1 && (
                        <IconButton
                          icon={<Trash2 />}
                          variant="danger"
                          size="md"
                          onClick={() => removeSocialNetwork(index)}
                        />
                      )}
                    </div>
                  ))}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={addSocialNetwork}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Добавить соц. сеть
                  </Button>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    onClick={cancelEditingSocials}
                    disabled={saving}
                  >
                    Отмена
                  </Button>
                  <Button
                    variant="primary"
                    onClick={saveSocialNetworks}
                    loading={saving}
                  >
                    Сохранить
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                {Object.keys(shop.social_networks).length > 0 ? (
                  <div className="space-y-2">
                    {Object.entries(shop.social_networks).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700 last:border-0"
                      >
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          {key}:
                        </span>
                        <span className="text-gray-600 dark:text-gray-400">{value}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-sm italic">
                    Социальные сети не добавлены
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface EditableFieldProps {
  label: string;
  value: string;
  field: string;
  editingField: EditingField | null;
  onStartEdit: (field: string, value: string) => void;
  onCancel: () => void;
  onSave: () => void;
  onChange: (value: string) => void;
  saving: boolean;
}

function EditableField({
  label,
  value,
  field,
  editingField,
  onStartEdit,
  onCancel,
  onSave,
  onChange,
  saving,
}: EditableFieldProps) {
  const isEditing = editingField?.field === field;

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>

      {isEditing ? (
        <div className="flex gap-2">
          <Input
            value={editingField.value}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onSave();
              } else if (e.key === 'Escape') {
                onCancel();
              }
            }}
          />
          <IconButton
            icon={<Check />}
            variant="primary"
            onClick={onSave}
            disabled={saving}
          />
          <IconButton
            icon={<X />}
            variant="secondary"
            onClick={onCancel}
            disabled={saving}
          />
        </div>
      ) : (
        <div className="flex items-center gap-3 group">
          <div className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
            <span className="text-gray-900 dark:text-white">
              {value || <span className="text-gray-400 italic">Не указано</span>}
            </span>
          </div>
          <IconButton
            icon={<Edit2 />}
            size="sm"
            variant="ghost"
            onClick={() => onStartEdit(field, value)}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          />
        </div>
      )}
    </div>
  );
}
