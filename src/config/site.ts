export const siteConfig = {
  name: "GC³ Portal",
  description: "Enterprise Client Portal for Collaboration and Project Management",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ogImage: "/og.png",
  links: {
    twitter: "",
    github: "",
  },
};

export const navConfig = {
  mainNav: [
    { title: "Home", href: "/" },
    { title: "Team Hub", href: "/login/staff" },
    { title: "Partner With Us", href: "/login/client" },
  ],
};
