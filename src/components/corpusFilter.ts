import { PaperRow } from "./CorpusResultsList";

/** Client-side filters for a paper list (year/citations/venue). */
export interface CorpusResultsFilterState {
    yearMin: string;
    yearMax: string;
    citationsMin: string;
    citationsMax: string;
    venue: string;
}

export function emptyCorpusResultsFilter(): CorpusResultsFilterState {
    return {
        yearMin: "",
        yearMax: "",
        citationsMin: "",
        citationsMax: "",
        venue: "",
    };
}

export function hasActiveCorpusResultsFilters(f: CorpusResultsFilterState): boolean {
    return (
        f.yearMin.trim() !== "" ||
        f.yearMax.trim() !== "" ||
        f.citationsMin.trim() !== "" ||
        f.citationsMax.trim() !== "" ||
        f.venue.trim() !== ""
    );
}

export function filterCorpusResultsByFacets(
    papers: PaperRow[],
    f: CorpusResultsFilterState
): PaperRow[] {
    const ynMin = f.yearMin.trim() === "" ? null : Number(f.yearMin);
    const ynMax = f.yearMax.trim() === "" ? null : Number(f.yearMax);
    const hasYearMin = ynMin != null && !Number.isNaN(ynMin);
    const hasYearMax = ynMax != null && !Number.isNaN(ynMax);
    const cnMin = f.citationsMin.trim() === "" ? null : Number(f.citationsMin);
    const cnMax = f.citationsMax.trim() === "" ? null : Number(f.citationsMax);
    const hasCitMin = cnMin != null && !Number.isNaN(cnMin);
    const hasCitMax = cnMax != null && !Number.isNaN(cnMax);
    const venueQ = f.venue.trim().toLowerCase();

    return papers.filter((p) => {
        const y = p.Year != null ? Number(p.Year) : NaN;
        if (hasYearMin) {
            if (Number.isNaN(y)) {
                return false;
            }
            if (y < ynMin!) {
                return false;
            }
        }
        if (hasYearMax) {
            if (Number.isNaN(y)) {
                return false;
            }
            if (y > ynMax!) {
                return false;
            }
        }

        const cc = p.CitationCounts != null ? Number(p.CitationCounts) : NaN;
        if (hasCitMin) {
            if (Number.isNaN(cc)) {
                return false;
            }
            if (cc < cnMin!) {
                return false;
            }
        }
        if (hasCitMax) {
            if (Number.isNaN(cc)) {
                return false;
            }
            if (cc > cnMax!) {
                return false;
            }
        }

        if (venueQ) {
            const src = String(
                (p as { Venue?: string }).Venue || p.Source || ""
            ).toLowerCase();
            if (!src.includes(venueQ)) {
                return false;
            }
        }

        return true;
    });
}
