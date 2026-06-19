"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import type { Database } from "@/lib/types/database";
import { updateShop, submitKyc, requestShopDeletion } from "@/lib/vendor/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { FileUploadField } from "@/components/vendor/file-upload-field";

type Shop = Database["public"]["Tables"]["shops"]["Row"];

const KYC_VARIANT: Record<string, "secondary" | "default" | "destructive"> = {
  pending: "secondary",
  submitted: "default",
  approved: "default",
  rejected: "destructive",
};

export function ShopSettingsForm({
  shop,
  kycPreviewUrls,
}: {
  shop: Shop;
  kycPreviewUrls: { tradeLicense: string | null; nationalId: string | null };
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    shop_name: shop.shop_name,
    description: shop.description ?? "",
    logo_url: shop.logo_url,
    banner_url: shop.banner_url,
    return_policy: shop.return_policy ?? "",
    shipping_policy: shop.shipping_policy ?? "",
    business_email: shop.business_email ?? "",
    business_phone: shop.business_phone ?? "",
    address_street: shop.address_street ?? "",
    address_city: shop.address_city ?? "",
    address_state: shop.address_state ?? "",
    address_zip: shop.address_zip ?? "",
    announcement_banner: shop.announcement_banner ?? "",
    social_links: JSON.stringify(shop.social_links ?? {}, null, 2),
  });
  const [tradeLicenseUrl, setTradeLicenseUrl] = useState(shop.trade_license_url);
  const [nationalIdUrl, setNationalIdUrl] = useState(shop.national_id_url);
  const [deletionReason, setDeletionReason] = useState("");
  const [saving, setSaving] = useState(false);

  function set<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function saveSection(updates: Record<string, unknown>) {
    setSaving(true);
    const result = await updateShop(shop.id, updates);
    setSaving(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success("Saved");
    router.refresh();
  }

  async function handleSocialSave() {
    try {
      const parsed = JSON.parse(form.social_links || "{}");
      saveSection({ social_links: parsed });
    } catch {
      toast.error("Social links must be valid JSON");
    }
  }

  async function handleKycSubmit() {
    if (!tradeLicenseUrl || !nationalIdUrl) {
      toast.error("Upload both documents before submitting");
      return;
    }
    setSaving(true);
    const result = await submitKyc(shop.id, {
      trade_license_url: tradeLicenseUrl,
      national_id_url: nationalIdUrl,
    });
    setSaving(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success("KYC submitted for review");
    router.refresh();
  }

  async function handleDeletionRequest() {
    if (!deletionReason.trim()) {
      toast.error("Please provide a reason");
      return;
    }
    const result = await requestShopDeletion(shop.id, deletionReason);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Deletion request submitted");
    setDeletionReason("");
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold">{shop.shop_name}</h1>
        <Badge variant={KYC_VARIANT[shop.kyc_status] ?? "secondary"}>
          KYC: {shop.kyc_status}
        </Badge>
        {!shop.is_active ? <Badge variant="destructive">Suspended</Badge> : null}
      </div>
      {shop.kyc_status === "rejected" && shop.rejection_reason ? (
        <p className="text-sm text-destructive">
          Rejection reason: {shop.rejection_reason}
        </p>
      ) : null}

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="social">Social</TabsTrigger>
          <TabsTrigger value="kyc">KYC</TabsTrigger>
          <TabsTrigger value="danger">Danger zone</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4 max-w-lg pt-4">
          <div className="space-y-2">
            <Label>Shop name</Label>
            <Input
              value={form.shop_name}
              onChange={(event) => set("shop_name", event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Slug</Label>
            <Input value={shop.slug} disabled />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={(event) => set("description", event.target.value)}
            />
          </div>
          <FileUploadField
            label="Logo"
            bucket="shops"
            pathPrefix={`${shop.id}/logo`}
            value={form.logo_url}
            onChange={(url) => set("logo_url", url)}
          />
          <FileUploadField
            label="Banner"
            bucket="shops"
            pathPrefix={`${shop.id}/banner`}
            value={form.banner_url}
            onChange={(url) => set("banner_url", url)}
          />
          <div className="space-y-2">
            <Label>Announcement banner</Label>
            <Textarea
              placeholder="Shown on your storefront in the app"
              value={form.announcement_banner}
              onChange={(event) => set("announcement_banner", event.target.value)}
            />
          </div>
          <Button
            disabled={saving}
            onClick={() =>
              saveSection({
                shop_name: form.shop_name,
                description: form.description,
                logo_url: form.logo_url,
                banner_url: form.banner_url,
                announcement_banner: form.announcement_banner,
              })
            }
          >
            Save profile
          </Button>
        </TabsContent>

        <TabsContent value="policies" className="space-y-4 max-w-lg pt-4">
          <div className="space-y-2">
            <Label>Return policy</Label>
            <Textarea
              rows={5}
              value={form.return_policy}
              onChange={(event) => set("return_policy", event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Shipping policy</Label>
            <Textarea
              rows={5}
              value={form.shipping_policy}
              onChange={(event) => set("shipping_policy", event.target.value)}
            />
          </div>
          <Button
            disabled={saving}
            onClick={() =>
              saveSection({
                return_policy: form.return_policy,
                shipping_policy: form.shipping_policy,
              })
            }
          >
            Save policies
          </Button>
        </TabsContent>

        <TabsContent value="contact" className="space-y-4 max-w-lg pt-4">
          <div className="space-y-2">
            <Label>Business email</Label>
            <Input
              type="email"
              value={form.business_email}
              onChange={(event) => set("business_email", event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Business phone</Label>
            <Input
              value={form.business_phone}
              onChange={(event) => set("business_phone", event.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Street</Label>
              <Input
                value={form.address_street}
                onChange={(event) => set("address_street", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>City</Label>
              <Input
                value={form.address_city}
                onChange={(event) => set("address_city", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>State</Label>
              <Input
                value={form.address_state}
                onChange={(event) => set("address_state", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>ZIP</Label>
              <Input
                value={form.address_zip}
                onChange={(event) => set("address_zip", event.target.value)}
              />
            </div>
          </div>
          <Button
            disabled={saving}
            onClick={() =>
              saveSection({
                business_email: form.business_email,
                business_phone: form.business_phone,
                address_street: form.address_street,
                address_city: form.address_city,
                address_state: form.address_state,
                address_zip: form.address_zip,
              })
            }
          >
            Save contact info
          </Button>
        </TabsContent>

        <TabsContent value="social" className="space-y-4 max-w-lg pt-4">
          <div className="space-y-2">
            <Label>Social links (JSON)</Label>
            <Textarea
              rows={6}
              className="font-mono text-sm"
              value={form.social_links}
              onChange={(event) => set("social_links", event.target.value)}
            />
          </div>
          <Button disabled={saving} onClick={handleSocialSave}>
            Save social links
          </Button>
        </TabsContent>

        <TabsContent value="kyc" className="space-y-4 max-w-lg pt-4">
          <p className="text-sm text-muted-foreground">
            Upload your trade license and national ID for verification.
          </p>
          <FileUploadField
            label="Trade license"
            bucket="kyc-documents"
            pathPrefix={`${shop.id}`}
            value={tradeLicenseUrl}
            previewUrl={kycPreviewUrls.tradeLicense}
            isPublic={false}
            onChange={setTradeLicenseUrl}
          />
          <FileUploadField
            label="National ID"
            bucket="kyc-documents"
            pathPrefix={`${shop.id}`}
            value={nationalIdUrl}
            previewUrl={kycPreviewUrls.nationalId}
            isPublic={false}
            onChange={setNationalIdUrl}
          />
          <Button disabled={saving} onClick={handleKycSubmit}>
            Submit for review
          </Button>
        </TabsContent>

        <TabsContent value="danger" className="space-y-4 max-w-lg pt-4">
          <p className="text-sm text-muted-foreground">
            Requesting deletion sends your shop for admin review. Your shop
            stays active until the request is approved.
          </p>
          <div className="space-y-2">
            <Label>Reason</Label>
            <Textarea
              value={deletionReason}
              onChange={(event) => setDeletionReason(event.target.value)}
            />
          </div>
          <Button variant="destructive" onClick={handleDeletionRequest}>
            Request shop deletion
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}
