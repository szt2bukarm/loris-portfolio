

interface Props {
    activeCategory: string[];
    setActiveCategory: (activeCategory: string[]) => void;
}

const categories = [
    "All",
    "Web",
    "3D",
    "Graphics",
    "UI/UX",
    "Product"
]

export default function WorksGridFilter({
    activeCategory,
    setActiveCategory
}: Props) {

    const handleSelect = (category: string) => {
        
        if (category === "All") {
            setActiveCategory(["All"]);
            return;
        }

        let newCategories = [...activeCategory];

        // If "All" was active, clear it first
        if (newCategories.includes("All")) {
            newCategories = [];
        }

        // Toggle selection
        if (newCategories.includes(category)) {
            newCategories = newCategories.filter(c => c !== category);
        } else {
            newCategories.push(category);
        }

        // If nothing selected, default back to "All"
        if (newCategories.length === 0) {
            setActiveCategory(["All"]);
        } else {
            setActiveCategory(newCategories);
        }
    };

    return (
        <div className="fixed left-[10px] sm:left-[20px] lg:left-[50px] top-[130px] lg:top-[150px] flex gap-[10px] z-[20]">
            {categories.map((category, index) => (
                <button key={index} className={`${activeCategory.includes(category) ? "text-white font-ppsemibold text-md" : "text-white/50 font-ppsemibold text-md cursor-pointer hover:opacity-50"} transition-all duration-150`} onClick={() => handleSelect(category)}>{category}</button>
            ))}
        </div>
    )
}