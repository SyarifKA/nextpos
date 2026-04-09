"use client";

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import React, { useEffect, useRef, useState } from "react";
import { createRoot, Root } from "react-dom/client";
import { TypeCost } from "@/models/type_cost";

const MySwal = withReactContent(Swal);

interface CostForm {
  name: string;
  amount: string;
}

const InputField = ({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: any) => (
  <div className="flex flex-col gap-2">
    <label className="font-medium text-gray-700">{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="px-4 py-3 border border-gray-300 rounded-lg
        focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
);

const ModalContent = ({
  onClose,
  onSubmit,
  initialData,
}: {
  onClose: () => void;
  onSubmit: (data: CostForm) => void;
  initialData: CostForm;
}) => {
  const [local, setLocal] = useState<CostForm>(initialData);

  const isValid = local.name.trim() !== "" && Number(local.amount) > 0;

  return (
    <div className="flex flex-col w-full p-6 text-start">
      <h2 className="text-2xl font-semibold text-primary">
        Edit Pengeluaran
      </h2>
      <p className="text-gray-600 text-md mt-1">
        Ubah data pengeluaran
      </p>

      <div className="mt-6 grid gap-4">
        <InputField
          label="Nama Pengeluaran"
          value={local.name}
          placeholder="Contoh: Sewa ruko"
          onChange={(e: any) =>
            setLocal((s) => ({ ...s, name: e.target.value }))
          }
        />

        <InputField
          label="Nominal"
          type="number"
          value={local.amount}
          placeholder="Contoh: 2000000"
          onChange={(e: any) =>
            setLocal((s) => ({ ...s, amount: e.target.value }))
          }
        />
      </div>

      <div className="flex justify-end gap-3 mt-8">
        <button
          onClick={onClose}
          className="px-5 py-3 rounded-lg bg-gray-200 hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          disabled={!isValid}
          onClick={() => onSubmit(local)}
          className={`px-6 py-3 rounded-lg text-white ${
            isValid
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          Simpan
        </button>
      </div>
    </div>
  );
};

const EditCostModal = ({
  open,
  cost,
  onClose,
  onSuccess,
}: {
  open: boolean;
  cost: TypeCost | null;
  onClose: () => void;
  onSuccess: () => void;
}) => {
  const reactRootRef = useRef<Root | null>(null);

  const handleSubmit = async (data: CostForm) => {
    if (!cost) return;

    const res = await fetch(`/api/cost/${cost.id}`, {
      method: "PUT",
      body: JSON.stringify({
        name: data.name,
        amount: Number(data.amount),
      }),
    });

    if (res.ok) {
      onSuccess();
      MySwal.fire({
        icon: "success",
        title: "Pengeluaran diperbarui",
        timer: 1200,
        showConfirmButton: false,
      });
    } else {
      MySwal.fire({
        icon: "error",
        title: "Gagal memperbarui pengeluaran",
      });
    }
    onClose();
  };

  useEffect(() => {
    if (!open || !cost) return;

    const initialData: CostForm = {
      name: cost.name,
      amount: String(cost.amount),
    };

    MySwal.fire({
      html: `<div id="react-swal-container"></div>`,
      showConfirmButton: false,
      width: "520px",
      padding: 0,
      didOpen: () => {
        const container = document.getElementById("react-swal-container");
        if (container) {
          reactRootRef.current = createRoot(container);
          reactRootRef.current.render(
            <ModalContent
              initialData={initialData}
              onClose={() => {
                MySwal.close();
                onClose();
              }}
              onSubmit={handleSubmit}
            />
          );
        }
      },
      willClose: () => {
        reactRootRef.current?.unmount();
        reactRootRef.current = null;
      },
    });
  }, [open, cost]);

  return null;
};

export default EditCostModal;
