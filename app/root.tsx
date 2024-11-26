import {
  json,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
 } from "@remix-run/react";
 import { redirect } from "@remix-run/node";
 import type {
  LinksFunction,
  LoaderFunctionArgs,
  MetaFunction,
 } from "@remix-run/node";
 import { getUserId } from "~/services/session.server";
 import { supabase } from "~/supabase/supabaseClient";
 
 import "./tailwind.css";
 
 export async function loader({ request }: LoaderFunctionArgs) {
  if (!process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET must be set");
  }
 
  const url = new URL(request.url);
  const userId = await getUserId(request);
  const { data: { session } } = await supabase.auth.getSession();
 
  const publicRoutes = ["/login", "/register", "/"];
  const isPublicRoute = publicRoutes.some(route => url.pathname.startsWith(route));
 
  if (!userId && !session?.user && !isPublicRoute) {
    return redirect("/login");
  }
 
  return json({
    ENV: {
      NODE_ENV: process.env.NODE_ENV,
    },
    isAuthenticated: !!userId || !!session?.user
  });
 }
 
 export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
 ];
 
 export const meta: MetaFunction = () => {
  const title = "Acutis Data Modos";
  const description = "Sistema de Gestão para Eventos Católicos.";
  const canonicalUrl = "https://acutis-dm.vercel.app";
  const imageUrl = `${canonicalUrl}/og-image.png`;
 
  return [
    { title },
    { name: "description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:url", content: canonicalUrl },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: imageUrl },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: imageUrl },
    { name: "keywords", content: "gestão,eventos,católico,igreja,acutis" },
    { name: "author", content: "ADM" },
    { name: "theme-color", content: "#ECF3FF" },
    {
      name: "viewport",
      content: "width=device-width,initial-scale=1,viewport-fit=cover",
    },
    { name: "format-detection", content: "telephone=no" },
    { charSet: "utf-8" },
  ];
 };
 
 export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      dir="ltr"
      className="antialiased"
      suppressHydrationWarning
    >
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1,viewport-fit=cover"
        />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration
          getKey={(location) => {
            return location.pathname;
          }}
        />
        <Scripts />
      </body>
    </html>
  );
 }
 
 export default function App() {
  const { isAuthenticated } = useLoaderData<typeof loader>();
  return <Outlet context={{ isAuthenticated }} />;
 }