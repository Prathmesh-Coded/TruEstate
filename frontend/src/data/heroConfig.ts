// This file defines the content for each navigation tab in the hero section.

export interface HeroTab {
  id: string;
  title: (location: string) => string;
  subtitle: string;
}

export const heroTabs: HeroTab[] = [
  {
    id: "buy",
    title: (location) => `Find Your Dream Home in ${location}`,
    subtitle: "Discover thousands of properties for sale.",
  },
  {
    id: "rent",
    title: (location) => `Rental Properties in ${location}`,
    subtitle: "Secure your next rental with ease and confidence.",
  },
  {
    id: "pg",
    title: (location) => `Best P.G. Stays in ${location}`,
    subtitle: "Explore affordable and convenient paying guest accommodations.",
  },
  {
    id: "plots",
    title: (location) => `Land & Plots in ${location}`,
    subtitle: "Invest in your future with the perfect piece of land.",
  },
  {
    id: "commercial",
    title: (location) => `Commercial Real Estate in ${location}`,
    subtitle: "Find the ideal space for your business to thrive.",
  },
];
