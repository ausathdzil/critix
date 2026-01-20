import Footer from '@/components/layout/footer';
import { Input } from '@/components/ui/input';
import { discoverMovies } from '@/lib/data';
import { ArrowRight, Search } from 'lucide-react';
import Form from 'next/form';
import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';

export default function Home() {
  return (
    <>
      <section className="space-y-8 text-center pt-8">
        <article className="font-serif space-y-2 px-8">
          <h1 className="font-bold text-2xl sm:text-4xl text-primary">
            Review your favorite movies
          </h1>
          <p className="text-xs sm:text-lg">
            Critic your favorite movies and share your thoughts with the world.
          </p>
        </article>
      </section>
      <SearchForm />
      <HomeMovies />
      <Footer />
    </>
  );
}

function SearchForm() {
  return (
    <Form className="sm:w-1/2 mx-auto mb-4" action="/movies/search">
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      <div className="relative">
        <Input
          id="query"
          name="query"
          className="peer pe-9 ps-9"
          placeholder="Search for a movie..."
          type="search"
        />
        <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
          <Search size={16} strokeWidth={2} />
        </div>
        <button
          className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg text-muted-foreground/80 outline-offset-2 transition-colors hover:text-foreground focus:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Submit search"
          type="submit"
        >
          <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
        </button>
      </div>
    </Form>
  );
}

async function HomeMovies() {
  const data = await discoverMovies();
  const movies = data?.results?.slice(0, 6) ?? [];

  return (
    <section className="space-y-8 pb-8 px-0">
      <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        <Suspense fallback={<div>Loading...</div>}>
          {movies.map((movie) => (
            <li key={movie.id}>
              <Link
                className="max-w-[300px] text-center space-y-2"
                href={`/movies/${movie.id}`}
              >
                <div className="relative w-[300px] h-[450px]">
                  <Image
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                    alt={`${movie.title} poster`}
                    className="rounded-lg object-cover border-2 hover:shadow hover:border-primary transition-all hover:shadow-primary"
                    fill
                  />
                </div>
                <p>{movie.title}</p>
              </Link>
            </li>
          ))}
        </Suspense>
      </ul>
    </section>
  );
}

