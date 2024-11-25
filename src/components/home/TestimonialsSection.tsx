interface Testimonial {
  quote: string;
  author: string;
  role: string;
  company: string;
  image: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote: "FeatureFlow has transformed how we collect and prioritize user feedback. It's now an essential part of our product development process.",
    author: "Sarah Chen",
    role: "Product Manager",
    company: "TechCorp",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400"
  },
  {
    quote: "The analytics and insights we get from FeatureFlow help us make better product decisions. Our users love the transparency.",
    author: "Michael Rodriguez",
    role: "CEO",
    company: "StartupX",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400"
  },
  {
    quote: "Setting up FeatureFlow took minutes, and it immediately improved our feedback collection process. Highly recommended!",
    author: "Emily Watson",
    role: "Head of Product",
    company: "GrowthLabs",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400"
  }
];

export function TestimonialsSection() {
  return (
    <div className="py-24">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Loved by Product Teams</h2>
          <p className="text-xl text-gray-600">See what our customers have to say</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map(testimonial => (
            <div key={testimonial.author} className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center mb-6">
                <img
                  src={testimonial.image}
                  alt={testimonial.author}
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
                <div>
                  <div className="font-medium text-gray-900">{testimonial.author}</div>
                  <div className="text-sm text-gray-600">{testimonial.role} at {testimonial.company}</div>
                </div>
              </div>
              <p className="text-gray-600 italic">"{testimonial.quote}"</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}