export const metadata = {
  title: "HUMAN.md — Briana (Mazzio) May",
  description: "A working manifesto. Notes-to-self, mostly. Not a thinkpiece. Not a thread. Not a deck.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0e0e0e",
};

export default function HumanMdLayout({ children }) {
  return (
    <>
      <style>{`
        /* override root body background for this route */
        body { background: #0e0e0e !important; }
      `}</style>
      {children}
    </>
  );
}
