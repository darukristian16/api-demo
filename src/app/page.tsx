'use client'

import { useState, useEffect, useMemo } from 'react'
import { HoverEffect } from "@/components/ui/card-hover-effect"
import { projects } from "@/data/projectsData"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

const ITEMS_PER_PAGE = 6;

export default function Home() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  // Memoize filtered projects to prevent unnecessary recalculations
  const filteredProjects = useMemo(() => {
    return projects.filter(project =>
      project.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE);

  // Memoize current page projects
  const currentProjects = useMemo(() => {
    return filteredProjects.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    );
  }, [filteredProjects, currentPage]);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24">
      <div className="max-w-2xl mx-auto p-4">
        <h1 className="relative z-10 text-4xl md:text-7xl bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-600 text-center font-sans font-bold mb-4">
          Telkom AI API Showcase
        </h1>
        <p className="text-neutral-500 max-w-lg mx-auto my-2 text-sm text-center relative z-10 mb-8">
          Explore the power of Telkom Indonesia's AI-driven APIs. Discover innovative solutions crafted by the Telkom AI DAG Team to revolutionize your digital experiences.
        </p>
        <input
          type="text"
          placeholder="Search APIs..."
          className="rounded-lg border border-neutral-800 focus:ring-2 focus:ring-teal-500 w-full relative z-10 mt-4 bg-neutral-950 placeholder:text-neutral-700 pl-3 p-2"
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Search APIs"
        />
      </div>
      <div className="max-w-5xl mx-auto px-4 md:px-8 mt-12">
        <HoverEffect items={currentProjects.map(project => ({
          ...project,
          link: `/api/${project.slug}`
        }))} />
      </div>
      {totalPages > 1 && (
        <div className="relative z-20 mt-8">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  href="#" 
                  onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
              {[...Array(totalPages)].map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink 
                    href="#" 
                    isActive={currentPage === i + 1}
                    onClick={() => handlePageChange(i + 1)}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext 
                  href="#" 
                  onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </main>
  )
}
