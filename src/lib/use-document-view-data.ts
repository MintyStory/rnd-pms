"use client";

import { useEffect, useState } from "react";
import { collection, doc, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type {
  AppUser,
  Component,
  DocumentRecord,
  FormType,
  Project,
  Standard,
  Vendor,
} from "@/types";

export interface Masters {
  standards: Standard[];
  components: Component[];
  vendors: Vendor[];
  users: AppUser[];
}

export function useDocumentViewData(projectId: string, formType: FormType) {
  const [project, setProject] = useState<Project | null>(null);
  const [docRecord, setDocRecord] = useState<DocumentRecord | null>(null);
  const [projectDocuments, setProjectDocuments] = useState<DocumentRecord[]>([]);
  const [masters, setMasters] = useState<Masters>({
    standards: [],
    components: [],
    vendors: [],
    users: [],
  });

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "projects", projectId), (snap) => {
      if (snap.exists()) setProject({ id: snap.id, ...(snap.data() as Omit<Project, "id">) });
    });
    return () => unsub();
  }, [projectId]);

  useEffect(() => {
    const unsub = onSnapshot(
      query(
        collection(db, "documents"),
        where("projectId", "==", projectId),
        where("formType", "==", formType)
      ),
      (snap) => {
        if (snap.empty) {
          setDocRecord(null);
          return;
        }
        const d = snap.docs[0];
        setDocRecord({ id: d.id, ...(d.data() as Omit<DocumentRecord, "id">) });
      }
    );
    return () => unsub();
  }, [projectId, formType]);

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, "documents"), where("projectId", "==", projectId)),
      (snap) =>
        setProjectDocuments(
          snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<DocumentRecord, "id">) }))
        )
    );
    return () => unsub();
  }, [projectId]);

  useEffect(() => {
    const unsubStandards = onSnapshot(collection(db, "standards"), (snap) =>
      setMasters((m) => ({
        ...m,
        standards: snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Standard, "id">) })),
      }))
    );
    const unsubComponents = onSnapshot(collection(db, "components"), (snap) =>
      setMasters((m) => ({
        ...m,
        components: snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Component, "id">) })),
      }))
    );
    const unsubVendors = onSnapshot(collection(db, "vendors"), (snap) =>
      setMasters((m) => ({
        ...m,
        vendors: snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Vendor, "id">) })),
      }))
    );
    const unsubUsers = onSnapshot(collection(db, "users"), (snap) =>
      setMasters((m) => ({
        ...m,
        users: snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<AppUser, "id">) })),
      }))
    );
    return () => {
      unsubStandards();
      unsubComponents();
      unsubVendors();
      unsubUsers();
    };
  }, []);

  return { project, docRecord, projectDocuments, masters };
}
