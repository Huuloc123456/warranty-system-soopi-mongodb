/* Logo dùng chung cho màn nhân viên và giao diện khách. Tách khỏi customer.tsx để màn nhân viên
   không kéo theo customer.css (chỉ trang khách cần). */

/** Logo soopiwarranty: mascot + chữ; light = chữ trắng cho nền tối. */
export function BrandLogo({ light = false }: { light?: boolean }) {
  return (
    <>
      <img src="/images/brand/logo-mark.png" className="brand-mark" width={44} height={44} alt="" />
      <img src={`/images/brand/${light ? 'wordmark-light' : 'wordmark'}.png`} className="brand-wordmark" width={162} height={26} alt="soopiwarranty" />
    </>
  );
}
