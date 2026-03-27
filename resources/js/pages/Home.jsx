import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { 
  RiHomeSmileLine, RiInformationLine, RiStarLine, 
  RiGiftLine, RiGalleryLine, RiPhoneLine, 
  RiFacebookCircleLine, RiInstagramLine, RiTwitterLine, RiTiktokLine,
  RiArrowRightLine, RiPlayFill, RiArrowLeftSLine, RiArrowRightSLine,
  RiDashboardLine, RiArrowRightUpLine, RiCalendarEventLine
} from 'react-icons/ri';
import { MdOutlineLocationOn, MdMailOutline, MdPhoneInTalk, MdStar } from 'react-icons/md';
import { Link } from 'react-router-dom';
import { homeThunks, featureThunks, aboutThunks, offerThunks, galleryThunks, contactThunks } from '../store/slices/cmsSlice';
import { fetchRooms, fetchAllCategories } from '../store/slices/roomSlice';

// Placeholder for translation function
const t = (val) => val;

const Home = () => {
    const dispatch = useDispatch();
    const sliderRef = useRef(null);

    const { data: homeData, status: homeStatus } = useSelector(state => state.cms.home);
    const { data: featureData, status: featureStatus } = useSelector(state => state.cms.feature);
    const { data: aboutData, status: aboutStatus } = useSelector(state => state.cms.about);
    const { data: offerData, status: offerStatus } = useSelector(state => state.cms.offer);
    const { data: galleryData, status: galleryStatus } = useSelector(state => state.cms.gallery);
    const { data: contactData, status: contactStatus } = useSelector(state => state.cms.contact);
    const { rooms, allCategories, roomStatus } = useSelector(state => state.room);
    
    const [isScrolled, setIsScrolled] = useState(false);
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterCategory, setFilterCategory] = useState('All');
    const [filterGuests, setFilterGuests] = useState('Any');
    const [currentPage, setCurrentPage] = useState(1);
    const roomsPerPage = 10;

    useEffect(() => {
        dispatch(homeThunks.fetch());
        dispatch(featureThunks.fetch());
        dispatch(aboutThunks.fetch());
        dispatch(offerThunks.fetch());
        dispatch(galleryThunks.fetch());
        dispatch(contactThunks.fetch());
        dispatch(fetchRooms({ per_page: 50 })); // Get all for filtering
        dispatch(fetchAllCategories());
    }, [dispatch]);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Home', href: '#home' },
        { name: 'About', href: '#about' },
        { name: 'Features', href: '#features' },
        { name: 'Offers', href: '#offers' },
        { name: 'Gallery', href: '#gallery' },
        { name: 'Contact', href: '#contact' },
    ];

    const filteredRooms = rooms.filter(room => {
        const matchStatus = filterStatus === 'All' || room.status === filterStatus;
        const matchCategory = filterCategory === 'All' || room.category?.name === filterCategory;
        const matchGuests = filterGuests === 'Any' || room.capacity >= parseInt(filterGuests);
        return matchStatus && matchCategory && matchGuests;
    });

    // Pagination Logic
    const totalPages = Math.ceil(filteredRooms.length / roomsPerPage);
    const paginatedRooms = filteredRooms.slice(
        (currentPage - 1) * roomsPerPage,
        currentPage * roomsPerPage
    );

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [filterStatus, filterCategory, filterGuests]);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
    };

    const offers = [
        {
            title: 'Weekend Getaway',
            discount: '25% OFF',
            description: 'Enjoy 25% off level 3 nights during the weekends, including complimentary breakfast.',
            image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800',
        },
        {
            title: 'Culinary Delights',
            discount: '15% OFF',
            description: 'A gastronomic journey featuring a 3-course tasting menu paired with vintage selections.',
            image: 'https://images.unsplash.com/photo-1550966841-396ad88675c8?auto=format&fit=crop&q=80&w=800',
        },
        {
            title: 'Romance on the Lake',
            discount: '30% OFF',
            description: 'Champagne breakfast, private boat excursion, and evening lights on our lakeside terrace.',
            image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&q=80&w=800',
        }
    ];

    return (
        <div className="bg-white min-h-screen font-sans selection:bg-[#2D3A2E] selection:text-white">
            {/* Navbar */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-6 py-4 ${isScrolled ? 'bg-white/90 backdrop-blur-xl shadow-sm border-b border-gray-100' : 'bg-transparent'}`}>
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {homeStatus === 'loading' ? (
                            <div className="h-6 w-32 bg-gray-200 animate-pulse rounded" />
                        ) : (
                            <>
                                {homeData?.[0]?.logo_url && (
                                    <img 
                                        src={homeData[0].logo_url} 
                                        className="h-8 w-auto object-contain rounded-md border border-gray-100/50 p-0.5" 
                                        alt="Logo" 
                                    />
                                )}
                                <span className={`text-xl font-bold tracking-tight transition-colors duration-500 ${isScrolled ? 'text-[#2D3A2E]' : 'text-white'}`}>
                                    {homeData?.[0]?.hotel_name || 'The Elite Concierge'}
                                </span>
                            </>
                        )}
                    </div>

                    <div className="hidden md:flex items-center gap-10">
                        {navLinks.map((link) => (
                            <a 
                                key={link.name} 
                                href={link.href}
                                className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-all hover:text-[#B59441] ${isScrolled ? 'text-[#2D3A2E]' : 'text-white/80'}`}
                            >
                                {link.name}
                            </a>
                        ))}
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Space for buttons if needed later */}
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            {homeStatus === 'loading' ? (
                <div className="h-screen bg-[#2D3A2E] flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-[#B59441]/20 border-t-[#B59441] rounded-full animate-spin" />
                </div>
            ) : homeData && homeData[0]?.hero_urls?.length > 0 ? (
                <section id="home" className="relative h-screen overflow-hidden bg-[#2D3A2E]">
                    <Slider
                        dots={true}
                        infinite={true}
                        speed={1000}
                        fade={true}
                        autoplay={true}
                        autoplaySpeed={5000}
                        pauseOnHover={false}
                        arrows={false}
                        className="h-full hero-slider"
                    >
                        {homeData[0].hero_urls.map((url, i) => (
                            <div key={i} className="relative h-screen outline-none">
                                <div className="absolute inset-0">
                                    <img 
                                        src={url} 
                                        className="w-full h-full object-cover opacity-60" 
                                        alt={`Slide ${i}`} 
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/20 to-transparent" />
                                </div>
                                <div className="relative z-10 h-full flex items-center justify-center text-center px-6">
                                    <div className="max-w-5xl">
                                        <motion.div
                                            initial={{ opacity: 0, y: 30 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 1 }}
                                        >
                                            <p className="text-[#B59441] font-bold uppercase tracking-[0.5em] text-[10px] md:text-xs mb-6">Experience the Extraordinary</p>
                                            <h1 className="text-5xl md:text-8xl font-bold text-white mb-8 leading-[1.1]">The Art of <br/>Pure Hospitality</h1>
                                            <p className="text-lg md:text-xl text-white/90 font-light max-w-2xl mx-auto mb-12 leading-relaxed">
                                                A curated collection of exceptional stays where architecture meets cultural legacy.
                                            </p>
                                        </motion.div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </Slider>
                    
                    {/* Floating Search Bar (Static but preserved UI) */}
                    <div className="absolute bottom-32 left-0 right-0 z-20 px-6">
                        <motion.div 
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 1 }}
                            className="bg-white/10 backdrop-blur-2xl p-2 rounded-2xl border border-white/20 shadow-2xl max-w-4xl mx-auto hidden md:flex items-center"
                        >
                            <div className="flex-1 flex px-8 border-r border-white/10">
                                <div className="text-left py-2 w-full">
                                    <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1">Status</p>
                                    <select 
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                        className="bg-transparent border-none text-white font-semibold text-sm focus:ring-0 outline-none w-full cursor-pointer appearance-none p-0"
                                    >
                                        <option value="All" className="text-black">All Status</option>
                                        <option value="Available" className="text-black">Available</option>
                                        <option value="Booked" className="text-black">Booked</option>
                                        <option value="Maintenance" className="text-black">Maintenance</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex-1 flex px-8 border-r border-white/10">
                                <div className="text-left py-2 w-full">
                                    <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1">Category</p>
                                    <select 
                                        value={filterCategory}
                                        onChange={(e) => setFilterCategory(e.target.value)}
                                        className="bg-transparent border-none text-white font-semibold text-sm focus:ring-0 outline-none w-full cursor-pointer appearance-none truncate p-0"
                                    >
                                        <option value="All" className="text-black">All Categories</option>
                                        {allCategories.map(c => (
                                            <option key={c.id} value={c.name} className="text-black">{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="flex-1 flex px-8">
                                <div className="text-left py-2 w-full">
                                    <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1">Guests</p>
                                    <select 
                                        value={filterGuests}
                                        onChange={(e) => setFilterGuests(e.target.value)}
                                        className="bg-transparent border-none text-white font-semibold text-sm focus:ring-0 outline-none w-full cursor-pointer appearance-none p-0"
                                    >
                                        <option value="Any" className="text-black">Any Capacity</option>
                                        <option value="1" className="text-black">1+ Guests</option>
                                        <option value="2" className="text-black">2+ Guests</option>
                                        <option value="3" className="text-black">3+ Guests</option>
                                        <option value="4" className="text-black">4+ Guests</option>
                                        <option value="5" className="text-black">5+ Guests</option>
                                    </select>
                                </div>
                            </div>
                            <button 
                                onClick={() => {
                                    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className="bg-[#B59441] text-white px-10 py-5 rounded-xl font-bold text-xs uppercase tracking-[0.2em] hover:bg-white hover:text-[#2D3A2E] transition-all duration-500 shadow-xl"
                            >
                                Search
                            </button>
                        </motion.div>
                    </div>

                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.5, duration: 1 }}
                        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 hidden md:flex z-20"
                    >
                        <div className="w-[1px] h-20 bg-gradient-to-b from-white to-transparent" />
                        <span className="text-[10px] text-white/50 uppercase tracking-[0.4em] [writing-mode:vertical-lr]">Scroll</span>
                    </motion.div>
                </section>
            ) : (
                <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden bg-[#2D3A2E]">
                    <div className="absolute inset-0 z-0">
                        <img 
                            src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1920" 
                            className="w-full h-full object-cover opacity-60"
                            alt="Luxury Hotel"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/20 to-transparent" />
                    </div>
                    <div className="relative z-10 text-center px-6 max-w-5xl">
                        <p className="text-[#B59441] font-bold uppercase tracking-[0.5em] text-[10px] md:text-xs mb-6">Experience the Extraordinary</p>
                        <h1 className="text-5xl md:text-8xl font-bold text-white mb-8 leading-[1.1]">The Art of <br/>Pure Hospitality</h1>
                    </div>
                </section>
            )}

            {/* Our Rooms */}
            <section id="features" className="py-24 w-full" style={{ background: 'oklch(96.7% 0.003 264.542)' }}>
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
                    <div>
                        <p className="text-[#B59441] font-bold uppercase tracking-[0.4em] text-[10px] mb-3">Our Selection</p>
                        <h2 className="text-4xl md:text-5xl font-bold text-[#202921]">Our Rooms</h2>
                    </div>
                    {/* Filter categories removed - routing through Hero Search */}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {roomStatus === 'loading' ? (
                         [...Array(3)].map((_, i) => (
                            <div key={i} className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-gray-100 animate-pulse">
                                <div className="aspect-[4/3] bg-gray-100 rounded-[2rem] mb-6" />
                                <div className="h-6 bg-gray-100 w-2/3 mb-4 rounded" />
                                <div className="h-4 bg-gray-100 w-1/3 mb-10 rounded" />
                                <div className="h-14 bg-gray-100 rounded-[1.5rem]" />
                            </div>
                         ))
                    ) : paginatedRooms.length === 0 ? (
                        <div className="col-span-full py-20 text-center text-gray-400 font-light italic">{t('No rooms available in this category.')}</div>
                    ) : paginatedRooms.map((room, i) => (
                        <motion.div 
                            key={room.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: i * 0.1 }}
                            className="group bg-white rounded-[2.5rem] p-6 border border-gray-100/50 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] transition-all duration-500"
                        >
                            {/* Nested Image Slider */}
                            <div className="relative aspect-[16/11] mb-8 overflow-hidden rounded-[2rem]">
                                {room.images?.length > 0 ? (
                                    <Slider
                                        dots={true}
                                        infinite={room.images.length > 1}
                                        speed={500}
                                        slidesToShow={1}
                                        slidesToScroll={1}
                                        arrows={false}
                                        autoplay={true}
                                        autoplaySpeed={3000 + (i * 200)} // Staggered autoplay
                                        className="h-full inner-slick"
                                        dotsClass="slick-dots custom-dots"
                                    >
                                        {room.images.map((img, idx) => (
                                            <div key={idx} className="h-full aspect-[16/11] outline-none">
                                                <img 
                                                    src={`/storage/${img}`} 
                                                    alt={`Room ${room.room_number}`} 
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                                />
                                            </div>
                                        ))}
                                    </Slider>
                                ) : (
                                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300 italic text-xs">No images</div>
                                )}
                            </div>

                            <div className="px-2">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-2xl font-bold text-[#202921] truncate">{room.category?.name || 'Room'} {room.room_number}</h3>
                                    <div className="bg-gray-50 px-4 py-2 rounded-full flex items-center gap-1">
                                        <span className="text-lg font-bold text-[#202921]">{room.base_price}</span>
                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">/night</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-1.5 text-gray-500">
                                            <RiDashboardLine className="text-[#B59441]" />
                                            <span className="text-xs font-medium">Capacity: {room.capacity}</span>
                                        </div>
                                        <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${
                                            room.status === 'Available' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                        }`}>
                                            {room.status}
                                        </div>
                                    </div>
                                </div>

                                <p className="text-sm text-gray-500 font-light leading-relaxed mb-10 line-clamp-2">
                                    {room.features?.length > 0 
                                        ? room.features.join(', ') 
                                        : 'A private seaside retreat with spacious rooms, a pool, and stunning views — ideal for a relaxing getaway.'
                                    }
                                </p>

                                <button className="w-full bg-[#202921] text-white py-4 rounded-[1.5rem] font-bold text-base hover:bg-black transition-all duration-300 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)]">
                                    Reserve Now
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Pagination UI */}
                {totalPages > 1 && (
                    <div className="mt-20 flex flex-col items-center gap-6">
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 border ${
                                    currentPage === 1 
                                    ? 'border-gray-100 text-gray-300 cursor-not-allowed' 
                                    : 'border-gray-200 text-[#202921] hover:bg-[#202921] hover:text-white hover:border-[#202921] shadow-sm'
                                }`}
                            >
                                <RiArrowLeftSLine size={24} />
                            </button>

                            <div className="flex items-center gap-2">
                                {[...Array(totalPages)].map((_, idx) => {
                                    const pageNum = idx + 1;
                                    // Show first, last, and pages around current
                                    if (
                                        pageNum === 1 || 
                                        pageNum === totalPages || 
                                        (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                                    ) {
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => handlePageChange(pageNum)}
                                                className={`w-12 h-12 rounded-2xl text-sm font-bold transition-all duration-300 border ${
                                                    currentPage === pageNum
                                                    ? 'bg-[#202921] text-white border-[#202921] shadow-lg scale-110'
                                                    : 'bg-white text-gray-500 border-gray-200 hover:border-[#B59441] hover:text-[#B59441]'
                                                }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    } else if (
                                        pageNum === currentPage - 2 || 
                                        pageNum === currentPage + 2
                                    ) {
                                        return <span key={pageNum} className="text-gray-300 px-1">...</span>;
                                    }
                                    return null;
                                })}
                            </div>

                            <button 
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 border ${
                                    currentPage === totalPages 
                                    ? 'border-gray-100 text-gray-300 cursor-not-allowed' 
                                    : 'border-gray-200 text-[#202921] hover:bg-[#202921] hover:text-white hover:border-[#202921] shadow-sm'
                                }`}
                            >
                                <RiArrowRightSLine size={24} />
                            </button>
                        </div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                            Showing Page {currentPage} of {totalPages} — {filteredRooms.length} Total Rooms
                        </p>
                    </div>
                )}
            </div>
            </section>

            {/* Why Choose Us - Continuous Slider */}
            <section className="py-24 bg-gray-50 overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 text-center mb-16">
                    <motion.p 
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-[#B59441] font-bold uppercase tracking-[0.4em] text-[10px] mb-4"
                    >
                        Our Core Philosophy
                    </motion.p>
                    <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-bold text-[#202921]"
                    >
                        Why Choose Us
                    </motion.h2>
                </div>
                
                <div className="relative">
                    {featureStatus === 'loading' ? (
                        <div className="flex gap-8 overflow-hidden px-6">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="min-w-[300px] bg-white p-10 rounded-2xl border border-gray-100 shadow-sm animate-pulse">
                                    <div className="h-6 bg-gray-100 rounded w-1/2 mb-4"></div>
                                    <div className="space-y-2">
                                        <div className="h-3 bg-gray-50 rounded w-full"></div>
                                        <div className="h-3 bg-gray-50 rounded w-5/6"></div>
                                        <div className="h-3 bg-gray-50 rounded w-4/6"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : featureData && featureData.length > 0 ? (
                        <Slider
                            dots={false}
                            infinite={featureData.length > 3}
                            slidesToShow={4}
                            slidesToScroll={1}
                            autoplay={true}
                            speed={6000}
                            autoplaySpeed={0}
                            cssEase="linear"
                            pauseOnHover={true}
                            arrows={false}
                            className="feature-slider"
                            responsive={[
                                { breakpoint: 1280, settings: { slidesToShow: 3 } },
                                { breakpoint: 1024, settings: { slidesToShow: 2 } },
                                { breakpoint: 640,  settings: { slidesToShow: 1 } }
                            ]}
                        >
                            {featureData.map((item, i) => (
                                <div key={i} className="px-4 outline-none">
                                    <motion.div 
                                        whileHover={{ scale: 1.02 }}
                                        transition={{ duration: 0.3 }}
                                        className="bg-white p-10 rounded-2xl text-left border border-gray-100 shadow-sm hover:shadow-xl transition-shadow group h-full cursor-pointer"
                                    >
                                        <h3 className="text-xl font-bold text-[#202921] mb-4 group-hover:text-[#B59441] transition-colors">{item.title}</h3>
                                        <p className="text-sm text-gray-500 leading-relaxed font-light">{item.description}</p>
                                    </motion.div>
                                </div>
                            ))}
                        </Slider>
                    ) : (
                        <div className="text-center text-gray-400 italic font-light py-10">
                            No features available at the moment.
                        </div>
                    )}
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="py-24 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
                {aboutStatus === 'loading' ? (
                    <div className="contents">
                        <div className="aspect-[4/5] bg-gray-100 rounded-[2rem] animate-pulse"></div>
                        <div className="space-y-6 animate-pulse">
                            <div className="h-4 bg-gray-100 w-24 rounded"></div>
                            <div className="h-12 bg-gray-100 w-3/4 rounded"></div>
                            <div className="h-12 bg-gray-100 w-2/3 rounded"></div>
                            <div className="h-32 bg-gray-100 w-full rounded mt-8"></div>
                            <div className="flex gap-4 mt-8">
                                <div className="h-12 bg-gray-100 w-32 rounded"></div>
                                <div className="h-12 bg-gray-100 w-48 rounded"></div>
                            </div>
                        </div>
                    </div>
                ) : aboutData && aboutData.length > 0 ? (
                    <>
                        <motion.div 
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="relative w-full h-full min-h-[500px]"
                        >
                            <div className="absolute inset-0 rounded-[1.5rem] overflow-hidden shadow-lg border-opacity-50 border-gray-100/20">
                                <img 
                                    src={`/storage/${aboutData[0].image}`} 
                                    alt="About Us" 
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </motion.div>
                        
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="pr-0 lg:pr-8"
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-[1px] bg-[#A05A2C]"></div>
                                <p className="text-[#A05A2C] font-semibold text-sm">About US</p>
                            </div>
                            
                            <h2 className="text-[2.75rem] md:text-5xl font-medium text-[#1A1A1A] mb-8 leading-[1.15] tracking-tight font-sans">
                                Welcome To Our<br/>Moonlit Hotel & Resort
                            </h2>
                            
                            <div className="space-y-6 text-[#6B7280] text-[15px] leading-[1.8] font-light text-justify">
                                {/* Split description gracefully into two logical paragraphs if it's long enough, else display as one */}
                                {(() => {
                                    const desc = aboutData[0].description || '';
                                    const mid = Math.floor(desc.length / 2);
                                    let splitIndex = desc.lastIndexOf('. ', mid);
                                    if(splitIndex === -1) splitIndex = desc.lastIndexOf(' ', mid);
                                    if(splitIndex === -1 || desc.length < 150) {
                                        return <p>{desc}</p>;
                                    }
                                    return (
                                        <>
                                            <p>{desc.substring(0, splitIndex + 1).trim()}</p>
                                            <p>{desc.substring(splitIndex + 1).trim()}</p>
                                        </>
                                    );
                                })()}
                            </div>

                            <div className="mt-12 flex flex-col sm:flex-row items-start sm:items-center gap-8">
                                <button className="px-8 py-3.5 bg-[#A05A2C] hover:bg-[#854B24] transition-colors text-white font-medium rounded-md shadow-sm">
                                    Learn More
                                </button>
                                
                                <div className="flex items-center gap-4 border-l border-gray-200 pl-8">
                                    <div className="flex -space-x-3">
                                        {[
                                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=64&h=64',
                                            'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=64&h=64',
                                            'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=64&h=64'
                                        ].map((img, i) => (
                                            <img key={i} src={img} alt="Member" className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-sm bg-gray-200" />
                                        ))}
                                        <div className="w-10 h-10 rounded-full border-2 border-white bg-[#A05A2C] text-white flex items-center justify-center text-xs font-bold z-10">
                                            +
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold text-[#1A1A1A] text-sm">4.9 out of 5</span>
                                            <div className="flex text-[#A05A2C] text-[10px]">
                                                {[...Array(5)].map((_, i) => <MdStar key={i} />)}
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-500 font-medium">Our Professional Members</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                ) : (
                    <div className="col-span-full py-20 text-center text-gray-400 font-light italic">
                        About data not available.
                    </div>
                )}
            </section>

            {/* Special Offers */}
            <section id="offers" className="py-24 bg-gray-50 border-y border-gray-100">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-8">
                        <div>
                            <p className="text-[#B59441] font-bold uppercase tracking-[0.4em] text-[10px] mb-3">Limited Moments</p>
                            <h2 className="text-4xl md:text-5xl font-bold text-[#202921]">Exclusive Offers</h2>
                        </div>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => sliderRef.current?.slickPrev()}
                                className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center hover:bg-[#202921] hover:text-white transition-all text-gray-400"
                            >
                                <RiArrowLeftSLine size={24} />
                            </button>
                            <button 
                                onClick={() => sliderRef.current?.slickNext()}
                                className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center hover:bg-[#202921] hover:text-white transition-all text-gray-400"
                            >
                                <RiArrowRightSLine size={24} />
                            </button>
                        </div>
                    </div>

                    <div className="relative">
                        {offerStatus === 'loading' ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
                                        <div className="h-64 bg-gray-100"></div>
                                        <div className="p-8">
                                            <div className="h-6 bg-gray-100 w-3/4 mb-4 rounded"></div>
                                            <div className="h-4 bg-gray-100 w-full mb-2 rounded"></div>
                                            <div className="h-4 bg-gray-100 w-full mb-2 rounded"></div>
                                            <div className="h-4 bg-gray-100 w-2/3 mb-8 rounded"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : offerData && offerData.length > 0 ? (
                            <div className="offer-slider-container -mx-4">
                                <Slider
                                    ref={sliderRef}
                                    dots={false}
                                    infinite={offerData.length > 3}
                                    slidesToShow={3}
                                    slidesToScroll={1}
                                    arrows={false}
                                    responsive={[
                                        { breakpoint: 1024, settings: { slidesToShow: 2 } },
                                        { breakpoint: 640,  settings: { slidesToShow: 1 } }
                                    ]}
                                >
                                    {offerData.map((offer, i) => {
                                        const startDate = new Date(offer.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                        const endDate = new Date(offer.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

                                        return (
                                            <div key={i} className="px-4 pb-8 outline-none h-full">
                                                <motion.div 
                                                    initial={{ opacity: 0, y: 30 }}
                                                    whileInView={{ opacity: 1, y: 0 }}
                                                    viewport={{ once: true }}
                                                    transition={{ delay: i * 0.1 }}
                                                    className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 group hover:shadow-xl transition-all duration-500 h-full flex flex-col cursor-pointer"
                                                >
                                                    <div className="relative h-64 overflow-hidden flex-shrink-0">
                                                        <img src={`/storage/${offer.image}`} alt={offer.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                                        <div className="absolute top-4 left-4 bg-[#B59441] text-white text-[10px] font-bold px-3 py-1 rounded-lg uppercase tracking-[0.2em] shadow-lg">
                                                            {parseFloat(offer.discount)}% OFF
                                                        </div>
                                                    </div>
                                                    <div className="p-8 flex-1 flex flex-col">
                                                        <h3 className="text-xl font-bold text-[#202921] mb-2">{offer.title}</h3>
                                                        <div className="flex items-center gap-2 text-sm text-[#A05A2C] font-medium mb-4 bg-orange-50 w-fit px-3 py-1 rounded-full">
                                                            <RiCalendarEventLine />
                                                            <span>{startDate} - {endDate}</span>
                                                        </div>
                                                        <p className="text-sm text-gray-400 font-light leading-relaxed flex-1">{offer.description}</p>
                                                    </div>
                                                </motion.div>
                                            </div>
                                        );
                                    })}
                                </Slider>
                            </div>
                        ) : (
                            <div className="text-center text-gray-400 italic font-light py-10">
                                No offers available at the moment.
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Gallery */}
            <section id="gallery" className="py-24 max-w-7xl mx-auto px-6 bg-white">
                <div className="text-center mb-16">
                    <p className="text-[#B59441] font-bold uppercase tracking-[0.4em] text-[10px] mb-4">Visual Poetry</p>
                    <h2 className="text-4xl md:text-5xl font-bold text-[#202921]">The Collection</h2>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:h-[600px]">
                    {galleryStatus === 'loading' ? (
                        <>
                            <div className="col-span-2 row-span-2 rounded-2xl overflow-hidden shadow-lg bg-gray-100 animate-pulse"></div>
                            <div className="rounded-2xl overflow-hidden shadow-md bg-gray-100 animate-pulse hidden md:block"></div>
                            <div className="rounded-2xl overflow-hidden shadow-md bg-gray-100 animate-pulse hidden md:block"></div>
                            <div className="col-span-2 md:col-span-1 border border-gray-100/20 rounded-2xl overflow-hidden shadow-md bg-gray-100 animate-pulse"></div>
                            <div className="hidden md:block rounded-2xl overflow-hidden shadow-md bg-gray-100 animate-pulse"></div>
                        </>
                    ) : galleryData && galleryData.length > 0 && galleryData[0].gallery ? (
                        galleryData[0].gallery.slice(0, 5).map((imagePath, i) => {
                            // Define the specific classes for each index to maintain the masonry layout
                            const classes = [
                                "col-span-2 row-span-2 rounded-2xl overflow-hidden shadow-lg", // 0: Large left image
                                "rounded-2xl overflow-hidden shadow-md",                       // 1: Top right inner
                                "rounded-2xl overflow-hidden shadow-md",                       // 2: Bottom right inner
                                "col-span-2 md:col-span-1 rounded-2xl overflow-hidden shadow-md", // 3: Bottom left inner
                                "hidden md:block rounded-2xl overflow-hidden shadow-md"        // 4: Far right, hidden mobile
                            ];
                            
                            // If there are fewer than 5 images, we fallback to a standard card if the specific slot isn't ideal
                            const className = classes[i] || "rounded-2xl overflow-hidden shadow-md";

                            return (
                                <div key={i} className={className}>
                                    <img 
                                        src={`/storage/${imagePath}`} 
                                        alt={`Gallery Image ${i + 1}`} 
                                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" 
                                    />
                                </div>
                            );
                        })
                    ) : (
                        <div className="col-span-full py-20 text-center text-gray-400 font-light italic">
                            No gallery images available.
                        </div>
                    )}
                </div>
            </section>

            {/* Contact Us */}
            <section id="contact" className="py-24 bg-gray-50 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 relative z-10">
                    <motion.div>
                        <p className="text-[#B59441] font-bold uppercase tracking-[0.4em] text-[10px] mb-4">Let's Connect</p>
                        <h2 className="text-4xl md:text-5xl font-bold text-[#202921] mb-12">Contact Us</h2>
                        
                        <div className="space-y-8">
                            {contactStatus === 'loading' ? (
                                <div className="space-y-8">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="flex gap-6 animate-pulse">
                                            <div className="w-12 h-12 bg-gray-200 rounded-xl flex-shrink-0"></div>
                                            <div className="w-full">
                                                <div className="h-3 bg-gray-200 rounded w-1/4 mb-2"></div>
                                                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : contactData && contactData.length > 0 ? (
                                [
                                    { icon: <MdOutlineLocationOn />, title: 'Our Address', desc: contactData[0].address },
                                    { icon: <MdPhoneInTalk />, title: 'Phone', desc: contactData[0].phone },
                                    { icon: <MdMailOutline />, title: 'Email', desc: contactData[0].email },
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-6">
                                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-[#B59441] shadow-sm border border-gray-100 flex-shrink-0">
                                            <span className="text-xl">{item.icon}</span>
                                        </div>
                                        <div>
                                            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-1">{item.title}</h4>
                                            <p className="text-[#202921] font-bold text-base">{item.desc}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-gray-400 italic text-sm">Contact data dynamically unavailable</div>
                            )}
                        </div>
                    </motion.div>

                    <motion.div className="rounded-2xl shadow-xl overflow-hidden min-h-[400px]">
                        {contactStatus === 'loading' ? (
                            <div className="w-full h-full bg-gray-200 animate-pulse min-h-[400px]"></div>
                        ) : contactData && contactData.length > 0 && contactData[0].maps_iframe ? (
                            <div 
                                className="w-full h-full min-h-[400px] [&>iframe]:w-full [&>iframe]:h-full [&>iframe]:min-h-[400px] [&>iframe]:border-none"
                                dangerouslySetInnerHTML={{ __html: contactData[0].maps_iframe }}
                            />
                        ) : (
                            <div className="w-full h-full bg-gray-100 flex items-center justify-center min-h-[400px]">
                                <span className="text-gray-400 text-sm">Map unavailable</span>
                            </div>
                        )}
                    </motion.div>

                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white pt-24 pb-12 border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
                    <div className="col-span-1">
                        <span className="text-2xl font-bold text-[#202921] mb-6 block">The Elite Concierge</span>
                        <p className="text-sm text-gray-400 font-light leading-relaxed mb-8">Crafting experiences that transcend the ordinary. Every detail is a testament to our commitment to luxury.</p>
                        <div className="flex gap-4">
                            <a href={contactData?.[0]?.facebook || '#'} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 hover:text-[#B59441] transition-all"><RiFacebookCircleLine size={22} /></a>
                            <a href={contactData?.[0]?.instagram || '#'} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 hover:text-[#B59441] transition-all"><RiInstagramLine size={22} /></a>
                            <a href={contactData?.[0]?.tiktok || '#'} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 hover:text-[#B59441] transition-all"><RiTiktokLine size={22} /></a>
                        </div>
                    </div>
                    
                    <div>
                        <h4 className="text-[10px] font-bold text-[#202921] uppercase tracking-[0.3em] mb-8">Navigation</h4>
                        <ul className="space-y-4">
                            {navLinks.map(link => (
                                <li key={link.name}><a href={link.href} className="text-sm font-medium text-gray-600 hover:text-[#B59441] transition-all">{link.name}</a></li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-[10px] font-bold text-[#202921] uppercase tracking-[0.3em] mb-8">Services</h4>
                        <ul className="space-y-4">
                            <li><a href="#" className="text-sm font-medium text-gray-600 hover:text-[#B59441] transition-all">Luxury Suites</a></li>
                            <li><a href="#" className="text-sm font-medium text-gray-600 hover:text-[#B59441] transition-all">Gourmet Dining</a></li>
                            <li><a href="#" className="text-sm font-medium text-gray-600 hover:text-[#B59441] transition-all">Wellness & Spa</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-[10px] font-bold text-[#202921] uppercase tracking-[0.3em] mb-8">Newsletter</h4>
                        <p className="text-sm text-gray-400 mb-6 font-light">Join our exclusive mailing list for updates.</p>
                        <div className="flex bg-gray-50 p-2 rounded-xl border border-gray-100">
                            <input type="email" placeholder="Email address" className="bg-transparent border-none focus:ring-0 text-sm px-4 flex-1 outline-none" />
                            <button className="bg-[#202921] text-white p-3 rounded-lg">
                                <RiArrowRightLine size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-6 pt-12 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em]">© 2026 The Elite Concierge. All Rights Reserved.</p>
                    <div className="flex gap-8">
                        <a href="#" className="text-[10px] text-gray-400 uppercase tracking-[0.2em] hover:text-[#B59441]">Privacy</a>
                        <a href="#" className="text-[10px] text-gray-400 uppercase tracking-[0.2em] hover:text-[#B59441]">Terms</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;
