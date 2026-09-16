"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import type { Approval, DocumentRecord, DocumentStatus, FormType, UserRole } from "@/types";

export function useDocumentRecord<TContent>(
  projectId: string,
  formType: FormType,
  emptyContent: TContent
) {
  const { profile, firebaseUser } = useAuth();
  const [docRecord, setDocRecord] = useState<DocumentRecord<TContent> | null>(null);
  const [content, setContent] = useState<TContent>(emptyContent);
  const [status, setStatus] = useState<DocumentStatus>("draft");
  const [reviewerName, setReviewerName] = useState("");
  const [approverName, setApproverName] = useState("");
  const [reason, setReason] = useState("");
  const [dcoNo, setDcoNo] = useState("");
  const [saving, setSaving] = useState(false);
  const [approvals, setApprovals] = useState<Approval[]>([]);

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
        const record = {
          id: d.id,
          ...(d.data() as Omit<DocumentRecord<TContent>, "id">),
        };
        setDocRecord(record);
        setContent(record.content);
        setStatus(record.status);
        setReviewerName(record.reviewerName ?? "");
        setApproverName(record.approverName ?? "");
        setApprovals(record.approvals ?? []);
      }
    );
    return () => unsub();
  }, [projectId, formType]);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    const authorName = profile?.name ?? firebaseUser?.email ?? "알수없음";
    const today = new Date().toISOString().slice(0, 10);
    try {
      const revisionEntry = {
        rev: (docRecord?.revisionHistory?.length ?? 0) + 1,
        date: today,
        dcoNo: dcoNo || null,
        reason: reason || (docRecord ? "내용 수정" : "최초 작성"),
        author: authorName,
        reviewer: reviewerName,
        approver: approverName,
      };
      if (!docRecord) {
        await addDoc(collection(db, "documents"), {
          projectId,
          formType,
          status,
          reviewerName,
          approverName,
          content,
          revisionHistory: [revisionEntry],
        });
      } else {
        await updateDoc(doc(db, "documents", docRecord.id), {
          status,
          reviewerName,
          approverName,
          content,
          revisionHistory: [...docRecord.revisionHistory, revisionEntry],
        });
      }
      setReason("");
      setDcoNo("");
    } finally {
      setSaving(false);
    }
  }

  async function addApproval(role: UserRole) {
    if (!docRecord) return;
    const authorName = profile?.name ?? firebaseUser?.email ?? "알수없음";
    const today = new Date().toISOString().slice(0, 10);
    const next = [
      ...(docRecord.approvals ?? []).filter((a) => a.role !== role),
      { role, name: authorName, date: today },
    ];
    await updateDoc(doc(db, "documents", docRecord.id), { approvals: next });
  }

  return {
    docRecord,
    content,
    setContent,
    status,
    setStatus,
    reviewerName,
    setReviewerName,
    approverName,
    setApproverName,
    reason,
    setReason,
    dcoNo,
    setDcoNo,
    saving,
    handleSave,
    approvals,
    addApproval,
  };
}
