import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import {
  RiFacebookCircleLine, RiInstagramLine, RiTiktokLine,
  RiArrowLeftSLine, RiArrowRightSLine,
  RiDashboardLine, RiCalendarEventLine,
  RiMenuLine, RiCloseLine, RiLeafLine, RiRestaurantLine,
  RiMicLine, RiHotelBedLine, RiSparklingLine, RiArrowRightLine,
  RiMapPinLine, RiPhoneLine, RiMailLine, RiSendPlaneLine,
  RiCheckLine, RiStarFill,
} from 'react-icons/ri';
import { MdOutlineLocationOn, MdMailOutline, MdPhoneInTalk, MdStar } from 'react-icons/md';
import {
  useGetHomeQuery, useGetFeatureQuery, useGetAboutQuery,
  useGetOfferQuery, useGetGalleryQuery, useGetContactQuery
} from '../store/api/cmsApi';
import { useGetRoomsQuery, useGetAllCategoriesQuery } from '../store/api/roomApi';

const t = (val) => val;

// ── Icon map for "Why Choose Us" features ──────────────────────────────────
const FEATURE_ICONS = [
  <RiLeafLine size={28} />,
  <RiRestaurantLine size={28} />,
  <RiMicLine size={28} />,
  <RiHotelBedLine size={28} />,
  <RiSparklingLine size={28} />,
  <RiMapPinLine size={28} />,
];

// ── Fallback stock room images (Cloudinary will override when available) ────
const ROOM_FALLBACKS = [
  'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1560347876-aeef00ee58a1?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80',
];

const Home = () => {
  const { data: rawHomeData,    isLoading: homeLoading    } = useGetHomeQuery();
  const { data: rawFeatureData, isLoading: featureLoading } = useGetFeatureQuery();
  const { data: rawAboutData,   isLoading: aboutLoading   } = useGetAboutQuery();
  const { data: rawOfferData,   isLoading: offerLoading   } = useGetOfferQuery();
  const { data: rawGalleryData, isLoading: galleryLoading } = useGetGalleryQuery();
  const { data: rawContactData, isLoading: contactLoading } = useGetContactQuery();
  const { data: roomsData,      isLoading: roomsLoading   } = useGetRoomsQuery({ per_page: 100 });
  const { data: categoriesData } = useGetAllCategoriesQuery();

  const homeData    = rawHomeData?.data    || rawHomeData;
  const featureData = rawFeatureData?.data || rawFeatureData;
  const aboutData   = rawAboutData?.data   || rawAboutData;
  const offerData   = rawOfferData?.data   || rawOfferData;
  const galleryData = rawGalleryData?.data || rawGalleryData;
  const contactData = rawContactData?.data || rawContactData;

  const rooms         = roomsData?.data || [];
  const allCategories = categoriesData  || [];

  const [isScrolled,     setIsScrolled]     = useState(false);
  const [isSidebarOpen,  setIsSidebarOpen]  = useState(false);
  const [filterStatus,   setFilterStatus]   = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterGuests,   setFilterGuests]   = useState('Any');
  const [currentPage,    setCurrentPage]    = useState(1);
  const [email,          setEmail]          = useState('');
  const [subscribed,     setSubscribed]     = useState(false);
  const roomsPerPage = 9;
  const sliderRef = useRef(null);
  const mobileScrollRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { name: 'Home',     href: '#home'     },
    { name: 'About',    href: '#about'    },
    { name: 'Rooms',    href: '#features' },
    { name: 'Offers',   href: '#offers'   },
    { name: 'Gallery',  href: '#gallery'  },
    { name: 'Contact',  href: '#contact'  },
  ];

  const filteredRooms = rooms.filter(room => {
    const matchStatus   = filterStatus   === 'All' || room.status         === filterStatus;
    const matchCategory = filterCategory === 'All' || room.category?.name === filterCategory;
    const matchGuests   = filterGuests   === 'Any' || room.capacity       >= parseInt(filterGuests);
    return matchStatus && matchCategory && matchGuests;
  });

  const totalPages    = Math.ceil(filteredRooms.length / roomsPerPage);
  const paginatedRooms = filteredRooms.slice((currentPage - 1) * roomsPerPage, currentPage * roomsPerPage);

  useEffect(() => { setCurrentPage(1); }, [filterStatus, filterCategory, filterGuests]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setTimeout(() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) { setSubscribed(true); setEmail(''); }
  };

  // ── Hero data ─────────────────────────────────────────────────────────────
  const heroItem    = homeData?.[0] || homeData?.data?.[0];
  const heroUrls    = heroItem?.hero_urls || [];
  const hasHeroImgs = heroUrls.length > 0;

  // ── About data ────────────────────────────────────────────────────────────
  const aboutItem = aboutData?.[0] || aboutData?.data?.[0];

  // ── Gallery data ──────────────────────────────────────────────────────────
  const galleryUrls = galleryData?.[0]?.gallery_urls || [];

  return (
    <div className="bg-white min-h-screen selection:bg-[#2D3A2E] selection:text-white"
         style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", fontSize: '16px', lineHeight: '1.7' }}>

      {/* ── Mobile Sidebar Overlay ────────────────────────────────────────── */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div key="overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }} onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]" />
        )}
      </AnimatePresence>

      {/* ── Mobile Sidebar Drawer ─────────────────────────────────────────── */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside key="sidebar"
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="fixed top-0 right-0 h-full w-72 bg-[#1E2A1F] z-[70] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-6 py-6 border-b border-white/10">
              <span className="text-white font-bold text-lg tracking-tight">
                {homeData?.[0]?.hotel_name || 'Navigation'}
              </span>
              <button onClick={() => setIsSidebarOpen(false)}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                aria-label="Close menu">
                <RiCloseLine size={22} />
              </button>
            </div>
            <nav className="flex flex-col gap-1 px-4 py-6 flex-1">
              {navLinks.map((link, i) => (
                <motion.a key={link.name} href={link.href}
                  onClick={() => setIsSidebarOpen(false)}
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.25 }}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-all font-medium text-base tracking-wide">
                  {link.name}
                </motion.a>
              ))}
            </nav>
            <div className="px-6 pb-8 border-t border-white/10 pt-6">
              <p className="text-white/30 text-xs tracking-widest uppercase">© 2026 {homeData?.[0]?.hotel_name || 'Hotel'}</p>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── Sticky Navbar ─────────────────────────────────────────────────── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-4 sm:px-6 ${isScrolled ? 'py-3 bg-white/95 backdrop-blur-xl shadow-md border-b border-gray-100' : 'py-4 sm:py-5 bg-transparent'}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            {homeLoading ? (
              <div className="h-7 w-36 bg-gray-200 animate-pulse rounded" />
            ) : (
              <>
                {homeData?.[0]?.logo_url && (
                  <img src={homeData[0].logo_url}
                    className="h-9 w-auto object-contain rounded-md" alt="Logo" />
                )}
                <span className={`text-xl font-bold tracking-tight transition-colors duration-500 ${isScrolled ? 'text-[#2D3A2E]' : 'text-white'}`}>
                  {homeData?.[0]?.hotel_name || 'The Elite Concierge'}
                </span>
              </>
            )}
          </div>
          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-8 xl:gap-10">
            {navLinks.map(link => (
              <a key={link.name} href={link.href}
                className={`text-[11px] font-bold uppercase tracking-[0.18em] transition-all hover:text-[#B59441] ${isScrolled ? 'text-[#2D3A2E]' : 'text-white/85'}`}>
                {link.name}
              </a>
            ))}
          </div>
          {/* Hamburger */}
          <button onClick={() => setIsSidebarOpen(true)}
            className={`lg:hidden w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isScrolled ? 'bg-gray-100 hover:bg-gray-200 text-[#2D3A2E]' : 'bg-white/10 hover:bg-white/20 text-white'}`}
            aria-label="Open menu">
            <RiMenuLine size={22} />
          </button>
        </div>
      </nav>

      {/* ── Hero Section ──────────────────────────────────────────────────── */}
      {homeLoading ? (
        <div className="h-screen bg-[#2D3A2E] flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-[#B59441]/20 border-t-[#B59441] rounded-full animate-spin" />
        </div>
      ) : hasHeroImgs ? (
        <section id="home" className="relative h-screen overflow-hidden bg-[#2D3A2E]">
          <Slider dots infinite speed={1000} fade autoplay autoplaySpeed={5500}
            pauseOnHover={false} arrows={false} className="h-full hero-slider">
            {heroUrls.map((url, i) => (
              <div key={i} className="relative h-screen outline-none">
                <div className="absolute inset-0">
                  <img src={url} className="w-full h-full object-cover opacity-65" alt={`Slide ${i}`} />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/20 to-black/40" />
                </div>
                <div className="relative z-10 h-full flex items-center justify-center text-center px-6">
                  <div className="max-w-4xl">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
                      <p className="text-[#B59441] font-bold uppercase tracking-[0.5em] text-xs mb-6">Experience the Extraordinary</p>
                      <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-6 sm:mb-8 leading-[1.08]">
                        The Art of <br /> Pure Hospitality
                      </h1>
                      <p className="text-lg md:text-xl text-white/85 font-light max-w-2xl mx-auto mb-10 leading-relaxed">
                        A curated collection of exceptional stays where architecture meets cultural legacy.
                      </p>
                      <a href="#features"
                        className="inline-flex items-center gap-2 bg-[#B59441] text-white px-8 py-4 rounded-full font-semibold text-sm uppercase tracking-widest hover:bg-white hover:text-[#2D3A2E] transition-all duration-500 shadow-2xl">
                        Explore Rooms <RiArrowRightLine size={16} />
                      </a>
                    </motion.div>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
          {/* Floating Filter Bar */}
          <div className="absolute bottom-28 left-0 right-0 z-20 px-4 sm:px-6">
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 1 }}
              className="bg-white/10 backdrop-blur-2xl p-2 rounded-2xl border border-white/20 shadow-2xl max-w-4xl mx-auto hidden md:flex items-center">
              {[
                { label: 'Status', value: filterStatus, onChange: setFilterStatus, options: [['All', 'All Status'], ['Available', 'Available'], ['Booked', 'Booked'], ['Maintenance', 'Maintenance']] },
                { label: 'Category', value: filterCategory, onChange: setFilterCategory, options: [['All', 'All Categories'], ...allCategories.map(c => [c.name, c.name])] },
                { label: 'Guests', value: filterGuests, onChange: setFilterGuests, options: [['Any', 'Any Capacity'], ['1', '1+ Guests'], ['2', '2+ Guests'], ['3', '3+ Guests'], ['4', '4+ Guests'], ['5', '5+ Guests']] },
              ].map((f, i, arr) => (
                <div key={f.label} className={`flex-1 flex px-6 xl:px-8 ${i < arr.length - 1 ? 'border-r border-white/15' : ''}`}>
                  <div className="text-left py-2.5 w-full">
                    <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1">{f.label}</p>
                    <select value={f.value} onChange={e => f.onChange(e.target.value)}
                      className="bg-transparent border-none text-white font-semibold text-sm focus:ring-0 outline-none w-full cursor-pointer appearance-none p-0 truncate">
                      {f.options.map(([val, label]) => (
                        <option key={val} value={val} className="text-black">{label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
              <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-[#B59441] text-white px-8 py-4 rounded-xl font-bold text-xs uppercase tracking-[0.2em] hover:bg-white hover:text-[#2D3A2E] transition-all duration-500 shadow-xl whitespace-nowrap">
                Search
              </button>
            </motion.div>
          </div>
          {/* Scroll indicator */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8, duration: 1 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-3 z-20">
            <div className="w-px h-16 bg-gradient-to-b from-white/60 to-transparent" />
            <span className="text-[9px] text-white/40 uppercase tracking-[0.35em] [writing-mode:vertical-lr]">Scroll</span>
          </motion.div>
        </section>
      ) : (
        <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden bg-[#2D3A2E]">
          <div className="absolute inset-0">
            <img src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1920"
              className="w-full h-full object-cover opacity-60" alt="Luxury Hotel" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/25 to-black/50" />
          </div>
          <div className="relative z-10 text-center px-6 max-w-5xl">
            <p className="text-[#B59441] font-bold uppercase tracking-[0.5em] text-xs mb-6">Experience the Extraordinary</p>
            <h1 className="text-5xl md:text-8xl font-bold text-white mb-8 leading-[1.08]">The Art of <br /> Pure Hospitality</h1>
          </div>
        </section>
      )}

      {/* ── Our Rooms ─────────────────────────────────────────────────────── */}
      <section id="features" className="py-16 sm:py-24 w-full bg-[#F7F7F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 sm:mb-16 gap-6">
            <div>
              <p className="text-[#B59441] font-bold uppercase tracking-[0.4em] text-xs mb-3">Our Selection</p>
              <h2 className="text-4xl md:text-5xl font-bold text-[#202921]">Our Rooms</h2>
            </div>
            {/* Mobile filter inline */}
            <div className="flex flex-wrap gap-3 sm:gap-4 md:hidden">
              {[
                { label: 'Status', value: filterStatus, onChange: setFilterStatus, options: [['All', 'All Status'], ['Available', 'Available'], ['Booked', 'Booked']] },
                { label: 'Guests', value: filterGuests, onChange: setFilterGuests, options: [['Any', 'Any'], ['1', '1+'], ['2', '2+'], ['3', '3+'], ['4', '4+']] },
              ].map(f => (
                <select key={f.label} value={f.value} onChange={e => f.onChange(e.target.value)}
                  className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white text-[#202921] font-medium focus:outline-none focus:border-[#B59441]">
                  {f.options.map(([val, label]) => <option key={val} value={val}>{label}</option>)}
                </select>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {roomsLoading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 animate-pulse">
                  <div className="aspect-[4/3] bg-gray-100 rounded-2xl mb-5" />
                  <div className="h-5 bg-gray-100 w-2/3 mb-3 rounded" />
                  <div className="h-4 bg-gray-100 w-1/3 mb-8 rounded" />
                  <div className="h-12 bg-gray-100 rounded-2xl" />
                </div>
              ))
            ) : paginatedRooms.length === 0 ? (
              <div className="col-span-full py-20 text-center text-gray-400 text-lg font-light italic">
                {t('No rooms match your filters.')}
              </div>
            ) : paginatedRooms.map((room, i) => {
              const imgList = room.image_urls?.length > 0 ? room.image_urls : null;
              const fallback = ROOM_FALLBACKS[i % ROOM_FALLBACKS.length];
              return (
                <motion.div key={room.id}
                  initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ duration: 0.55, delay: i * 0.08 }}
                  className="group bg-white rounded-3xl overflow-hidden border border-gray-100/80 hover:shadow-[0_24px_70px_-18px_rgba(0,0,0,0.13)] transition-all duration-500">
                  {/* Image */}
                  <div className="relative aspect-[16/11] overflow-hidden">
                    {imgList ? (
                      <Slider dots infinite={imgList.length > 1} speed={500} slidesToShow={1}
                        slidesToScroll={1} arrows={false} autoplay autoplaySpeed={3200 + i * 200}
                        className="h-full inner-slick" dotsClass="slick-dots custom-dots">
                        {imgList.map((img, idx) => (
                          <div key={idx} className="aspect-[16/11] outline-none">
                            <img src={img} alt={`Room ${room.room_number}`}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                          </div>
                        ))}
                      </Slider>
                    ) : (
                      <img src={fallback} alt={`Room ${room.room_number}`}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    )}
                    {/* Status badge */}
                    <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg ${room.status === 'Available' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                      {room.status}
                    </div>
                  </div>
                  {/* Content */}
                  <div className="p-5 sm:p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-[#202921] leading-tight">{room.category?.name || 'Luxury Room'}</h3>
                        <p className="text-sm text-gray-400 font-medium">Room {room.room_number} · Floor {room.floor || '—'}</p>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <span className="text-xl font-bold text-[#202921]">৳{parseFloat(room.base_price).toLocaleString()}</span>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">/night</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-4">
                      <RiDashboardLine className="text-[#B59441]" size={16} />
                      <span className="text-sm text-gray-500 font-medium">Up to {room.capacity} guests</span>
                    </div>
                    {room.features?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-5">
                        {room.features.slice(0, 4).map((f, fi) => (
                          <span key={fi} className="text-[11px] bg-gray-50 border border-gray-100 text-gray-500 px-2.5 py-0.5 rounded-full font-medium">{f}</span>
                        ))}
                        {room.features.length > 4 && (
                          <span className="text-[11px] bg-[#B59441]/10 text-[#B59441] px-2.5 py-0.5 rounded-full font-medium">+{room.features.length - 4} more</span>
                        )}
                      </div>
                    )}
                    <button className="w-full bg-[#202921] text-white py-3.5 rounded-2xl font-semibold text-sm hover:bg-[#B59441] transition-all duration-300 shadow-md">
                      Reserve Now
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-16 flex flex-col items-center gap-5">
              <div className="flex items-center gap-2">
                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all border ${currentPage === 1 ? 'border-gray-100 text-gray-300 cursor-not-allowed' : 'border-gray-200 text-[#202921] hover:bg-[#202921] hover:text-white hover:border-[#202921]'}`}>
                  <RiArrowLeftSLine size={22} />
                </button>
                {[...Array(totalPages)].map((_, idx) => {
                  const p = idx + 1;
                  if (p === 1 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1)) {
                    return (
                      <button key={p} onClick={() => handlePageChange(p)}
                        className={`w-11 h-11 rounded-2xl text-sm font-bold transition-all border ${currentPage === p ? 'bg-[#202921] text-white border-[#202921] shadow-lg scale-110' : 'bg-white text-gray-500 border-gray-200 hover:border-[#B59441] hover:text-[#B59441]'}`}>
                        {p}
                      </button>
                    );
                  } else if (p === currentPage - 2 || p === currentPage + 2) {
                    return <span key={p} className="text-gray-300 px-1">…</span>;
                  }
                  return null;
                })}
                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all border ${currentPage === totalPages ? 'border-gray-100 text-gray-300 cursor-not-allowed' : 'border-gray-200 text-[#202921] hover:bg-[#202921] hover:text-white hover:border-[#202921]'}`}>
                  <RiArrowRightSLine size={22} />
                </button>
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">
                Page {currentPage} of {totalPages} · {filteredRooms.length} Rooms
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ── Why Choose Us ─────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <motion.p initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="text-[#B59441] font-bold uppercase tracking-[0.4em] text-xs mb-4">
              Our Core Philosophy
            </motion.p>
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: 0.1 }} className="text-4xl md:text-5xl font-bold text-[#202921]">
              Why Choose Us
            </motion.h2>
          </div>

          {featureLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-50 rounded-3xl p-8 animate-pulse">
                  <div className="w-14 h-14 bg-gray-200 rounded-2xl mb-6" />
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-3" />
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-100 rounded w-full" />
                    <div className="h-3 bg-gray-100 rounded w-5/6" />
                  </div>
                </div>
              ))}
            </div>
          ) : featureData && featureData.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {featureData.map((item, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.07 }}
                  whileHover={{ y: -6 }}
                  className="group bg-gray-50 hover:bg-[#2D3A2E] rounded-3xl p-7 sm:p-8 text-left border border-gray-100 hover:border-transparent transition-all duration-500 cursor-pointer">
                  <div className="w-14 h-14 bg-white group-hover:bg-[#B59441]/20 rounded-2xl flex items-center justify-center text-[#B59441] mb-6 transition-all duration-500 shadow-sm">
                    {FEATURE_ICONS[i % FEATURE_ICONS.length]}
                  </div>
                  <h3 className="text-lg font-bold text-[#202921] group-hover:text-white mb-3 transition-colors duration-500 leading-snug">{item.title}</h3>
                  <p className="text-base text-gray-500 group-hover:text-white/70 leading-relaxed transition-colors duration-500">{item.description}</p>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-400 text-base italic py-10">No features available at the moment.</div>
          )}
        </div>
      </section>

      {/* ── About Section ─────────────────────────────────────────────────── */}
      <section id="about" className="py-16 sm:py-24 bg-[#F7F7F5] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {aboutLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center animate-pulse">
              <div className="aspect-[4/5] bg-gray-200 rounded-3xl" />
              <div className="space-y-5">
                <div className="h-4 bg-gray-200 w-24 rounded" />
                <div className="h-10 bg-gray-200 w-3/4 rounded" />
                <div className="h-32 bg-gray-200 rounded mt-6" />
                <div className="h-12 bg-gray-200 w-36 rounded mt-4" />
              </div>
            </div>
          ) : aboutItem ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center">
              <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.8 }}
                className="relative overflow-hidden rounded-3xl shadow-xl min-h-[320px] sm:min-h-[440px] lg:min-h-[560px]">
                <img src={aboutItem.image_url} alt="About Us"
                  className="w-full h-full object-cover absolute inset-0" />
                {/* Decorative badges */}
                <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-sm rounded-2xl px-5 py-3 shadow-lg">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    {[...Array(5)].map((_, i) => <RiStarFill key={i} className="text-[#B59441] text-sm" />)}
                  </div>
                  <p className="text-[#202921] font-bold text-sm">4.9 / 5 Guest Rating</p>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.8 }}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-px bg-[#B59441]" />
                  <p className="text-[#B59441] font-bold text-sm uppercase tracking-widest">About Us</p>
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#1A1A1A] mb-7 leading-[1.15] tracking-tight">
                  Welcome To Our<br />Grand Hotel & Resort
                </h2>
                <div className="space-y-5 text-[#4B5563] text-base leading-[1.85] text-justify">
                  {(() => {
                    const desc = aboutItem?.description || '';
                    const mid = Math.floor(desc.length / 2);
                    let split = desc.lastIndexOf('. ', mid);
                    if (split === -1) split = desc.lastIndexOf(' ', mid);
                    if (split === -1 || desc.length < 150) return <p>{desc}</p>;
                    return (
                      <>
                        <p>{desc.substring(0, split + 1).trim()}</p>
                        <p>{desc.substring(split + 1).trim()}</p>
                      </>
                    );
                  })()}
                </div>
                {/* Stats row */}
                <div className="grid grid-cols-3 gap-4 my-8 pt-6 border-t border-gray-200">
                  {[['15+', 'Years Experience'], ['200+', 'Luxury Rooms'], ['50K+', 'Happy Guests']].map(([num, label]) => (
                    <div key={label} className="text-center">
                      <p className="text-2xl sm:text-3xl font-bold text-[#202921] mb-1">{num}</p>
                      <p className="text-xs text-gray-500 font-medium leading-tight">{label}</p>
                    </div>
                  ))}
                </div>
                <button className="inline-flex items-center gap-2 px-8 py-4 bg-[#2D3A2E] hover:bg-[#B59441] transition-colors duration-300 text-white font-semibold rounded-2xl shadow-md text-sm">
                  Discover Our Story <RiArrowRightLine size={16} />
                </button>
              </motion.div>
            </div>
          ) : (
            <div className="py-20 text-center text-gray-400 text-base italic">About data not available.</div>
          )}
        </div>
      </section>

      {/* ── Exclusive Offers ──────────────────────────────────────────────── */}
      <section id="offers" className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 sm:mb-16 gap-6">
            <div>
              <p className="text-[#B59441] font-bold uppercase tracking-[0.4em] text-xs mb-3">Limited Moments</p>
              <h2 className="text-4xl md:text-5xl font-bold text-[#202921]">Exclusive Offers</h2>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  if (mobileScrollRef.current && window.innerWidth < 768) {
                    const cardWidth = mobileScrollRef.current.firstChild?.offsetWidth + 16 || mobileScrollRef.current.offsetWidth * 0.86;
                    mobileScrollRef.current.scrollBy({ left: -cardWidth, behavior: 'smooth' });
                  } else {
                    sliderRef.current?.slickPrev();
                  }
                }}
                className="w-12 h-12 rounded-full border-2 border-gray-200 flex items-center justify-center hover:bg-[#202921] hover:border-[#202921] hover:text-white transition-all text-gray-400">
                <RiArrowLeftSLine size={22} />
              </button>
              <button
                onClick={() => {
                  if (mobileScrollRef.current && window.innerWidth < 768) {
                    const cardWidth = mobileScrollRef.current.firstChild?.offsetWidth + 16 || mobileScrollRef.current.offsetWidth * 0.86;
                    mobileScrollRef.current.scrollBy({ left: cardWidth, behavior: 'smooth' });
                  } else {
                    sliderRef.current?.slickNext();
                  }
                }}
                className="w-12 h-12 rounded-full border-2 border-gray-200 flex items-center justify-center hover:bg-[#202921] hover:border-[#202921] hover:text-white transition-all text-gray-400">
                <RiArrowRightSLine size={22} />
              </button>
            </div>
          </div>

          {offerLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-gray-50 rounded-3xl overflow-hidden animate-pulse">
                  <div className="h-60 bg-gray-200" />
                  <div className="p-7 space-y-3">
                    <div className="h-5 bg-gray-200 w-3/4 rounded" />
                    <div className="h-4 bg-gray-100 rounded" />
                    <div className="h-4 bg-gray-100 w-4/5 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : offerData && offerData.length > 0 ? (
            <>
              {/* ── MOBILE: Native CSS scroll-snap (guaranteed 1 card at a time) ── */}
              <div
                ref={mobileScrollRef}
                className="md:hidden flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {offerData.map((offer, i) => {
                  const fmtDate = (d) => d ? new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
                  return (
                    <div key={i} className="flex-shrink-0 w-[82vw] snap-center">
                      <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm flex flex-col h-full">
                        <div className="relative overflow-hidden flex-shrink-0" style={{ height: '200px' }}>
                          <img
                            src={offer.image_url}
                            alt={offer.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                          <div className="absolute top-3 left-3 bg-[#B59441] text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                            {parseFloat(offer.discount)}% OFF
                          </div>
                        </div>
                        <div className="p-4 flex flex-col gap-2 flex-1">
                          <h3 className="text-base font-bold text-[#202921] leading-snug">{offer.title}</h3>
                          {(offer.start_date || offer.end_date) && (
                            <div className="flex items-center gap-1.5 text-xs text-[#B59441] font-semibold bg-amber-50 w-fit px-2.5 py-1 rounded-full">
                              <RiCalendarEventLine size={12} />
                              <span>{fmtDate(offer.start_date)} – {fmtDate(offer.end_date)}</span>
                            </div>
                          )}
                          <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">{offer.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ── DESKTOP: react-slick slider (md and above) ── */}
              <div className="hidden md:block overflow-hidden">
                <Slider
                  ref={sliderRef}
                  dots={false}
                  infinite={offerData.length > 3}
                  slidesToShow={3}
                  slidesToScroll={1}
                  arrows={false}
                  responsive={[
                    { breakpoint: 1280, settings: { slidesToShow: 3 } },
                    { breakpoint: 1024, settings: { slidesToShow: 2, slidesToScroll: 1 } },
                  ]}
                >
                  {offerData.map((offer, i) => {
                    const fmtDate = (d) => d ? new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
                    return (
                      <div key={i} className="px-3 pb-4 outline-none">
                        <motion.div
                          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                          className="bg-white rounded-3xl overflow-hidden border border-gray-100 group hover:shadow-2xl transition-all duration-500 flex flex-col cursor-pointer"
                        >
                          <div className="relative overflow-hidden flex-shrink-0" style={{ height: '240px' }}>
                            <img
                              src={offer.image_url}
                              alt={offer.title}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                            <div className="absolute top-4 left-4 bg-[#B59441] text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
                              {parseFloat(offer.discount)}% OFF
                            </div>
                          </div>
                          <div className="p-6 flex flex-col gap-2 flex-1">
                            <h3 className="text-xl font-bold text-[#202921] leading-snug">{offer.title}</h3>
                            {(offer.start_date || offer.end_date) && (
                              <div className="flex items-center gap-2 text-sm text-[#B59441] font-semibold bg-amber-50 w-fit px-3 py-1.5 rounded-full">
                                <RiCalendarEventLine size={14} />
                                <span>{fmtDate(offer.start_date)} – {fmtDate(offer.end_date)}</span>
                              </div>
                            )}
                            <p className="text-base text-gray-500 leading-relaxed line-clamp-3">{offer.description}</p>
                          </div>
                        </motion.div>
                      </div>
                    );
                  })}
                </Slider>
              </div>
            </>
          ) : (
            <div className="text-center text-gray-400 text-base italic py-10">No offers available at the moment.</div>
          )}
        </div>
      </section>

      {/* ── Gallery ─────────────────────────────────────────────────────────*/}
      <section id="gallery" className="py-16 sm:py-24 bg-[#F7F7F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <p className="text-[#B59441] font-bold uppercase tracking-[0.4em] text-xs mb-4">Visual Poetry</p>
            <h2 className="text-4xl md:text-5xl font-bold text-[#202921]">The Collection</h2>
          </div>

          {galleryLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className={`bg-gray-200 rounded-2xl animate-pulse ${i === 0 ? 'aspect-square md:row-span-2' : 'aspect-video'}`} />
              ))}
            </div>
          ) : galleryUrls.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              {/* Large featured image */}
              {galleryUrls[0] && (
                <div className="col-span-2 md:col-span-1 md:row-span-2 rounded-2xl overflow-hidden shadow-md group">
                  <img src={galleryUrls[0]} alt="Gallery 1"
                    className="w-full h-full object-cover min-h-[220px] md:min-h-0 hover:scale-105 transition-transform duration-700" />
                </div>
              )}
              {/* Remaining images */}
              {galleryUrls.slice(1, 5).map((url, i) => (
                <div key={i} className="rounded-2xl overflow-hidden shadow-sm group aspect-video">
                  <img src={url} alt={`Gallery ${i + 2}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                </div>
              ))}
              {/* Extra wide strip if 6th image available */}
              {galleryUrls[5] && (
                <div className="col-span-2 md:col-span-3 rounded-2xl overflow-hidden shadow-sm group aspect-[21/6]">
                  <img src={galleryUrls[5]} alt="Gallery 6"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                </div>
              )}
            </div>
          ) : (
            <div className="py-20 text-center text-gray-400 text-base italic">No gallery images available.</div>
          )}
        </div>
      </section>

      {/* ── Contact ──────────────────────────────────────────────────────── */}
      <section id="contact" className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <p className="text-[#B59441] font-bold uppercase tracking-[0.4em] text-xs mb-4">Let's Connect</p>
            <h2 className="text-4xl md:text-5xl font-bold text-[#202921] mb-10">Contact Us</h2>
            <div className="space-y-7">
              {contactLoading ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="flex gap-5 animate-pulse">
                    <div className="w-12 h-12 bg-gray-200 rounded-2xl flex-shrink-0" />
                    <div className="flex-1 space-y-2 pt-1">
                      <div className="h-3 bg-gray-200 w-24 rounded" />
                      <div className="h-4 bg-gray-200 w-2/3 rounded" />
                    </div>
                  </div>
                ))
              ) : contactData && contactData.length > 0 ? (
                [
                  { icon: <MdOutlineLocationOn size={22} />, label: 'Our Address', value: contactData[0].address },
                  { icon: <MdPhoneInTalk size={22} />,       label: 'Phone',       value: contactData[0].phone },
                  { icon: <MdMailOutline size={22} />,        label: 'Email',       value: contactData[0].email },
                ].map((item, i) => item.value && (
                  <div key={i} className="flex gap-5 items-start">
                    <div className="w-12 h-12 bg-[#F7F7F5] rounded-2xl flex items-center justify-center text-[#B59441] flex-shrink-0 shadow-sm">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-1">{item.label}</p>
                      <p className="text-[#202921] font-semibold text-base">{item.value}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-base italic">Contact information not available.</p>
              )}
            </div>
            {/* Social icons */}
            {contactData?.[0] && (
              <div className="mt-10 flex gap-3">
                {[
                  { href: contactData[0].facebook,  icon: <RiFacebookCircleLine size={20} /> },
                  { href: contactData[0].instagram, icon: <RiInstagramLine size={20} /> },
                  { href: contactData[0].tiktok,    icon: <RiTiktokLine size={20} /> },
                ].map(({ href, icon }, i) => (
                  <a key={i} href={href || '#'} target="_blank" rel="noreferrer"
                    className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500 hover:text-[#B59441] hover:border-[#B59441] transition-all">
                    {icon}
                  </a>
                ))}
              </div>
            )}
          </motion.div>

          {/* Map */}
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className="rounded-3xl shadow-xl overflow-hidden min-h-[320px] sm:min-h-[400px]">
            {contactLoading ? (
              <div className="w-full h-full bg-gray-200 animate-pulse min-h-[380px]" />
            ) : contactData?.[0]?.maps_iframe ? (
              <div className="w-full h-full min-h-[380px] [&>iframe]:w-full [&>iframe]:h-full [&>iframe]:min-h-[380px] [&>iframe]:border-none"
                dangerouslySetInnerHTML={{ __html: contactData[0].maps_iframe }} />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center min-h-[380px]">
                <span className="text-gray-400 text-base">Map unavailable</span>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="bg-[#1E2A1F] text-white pt-16 sm:pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 mb-14">
            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2.5 mb-5">
                {homeData?.[0]?.logo_url && (
                  <img src={homeData[0].logo_url} className="h-8 w-auto object-contain rounded-md brightness-[2]" alt="Logo" />
                )}
                <span className="text-xl font-bold tracking-tight">{homeData?.[0]?.hotel_name || 'The Elite Concierge'}</span>
              </div>
              <p className="text-white/50 text-base leading-relaxed mb-6">
                Crafting experiences that transcend the ordinary. Every detail is a testament to our commitment to luxury.
              </p>
              <div className="flex gap-3">
                {[
                  { href: contactData?.[0]?.facebook,  icon: <RiFacebookCircleLine size={20} /> },
                  { href: contactData?.[0]?.instagram, icon: <RiInstagramLine size={20} /> },
                  { href: contactData?.[0]?.tiktok,    icon: <RiTiktokLine size={20} /> },
                ].map(({ href, icon }, i) => (
                  <a key={i} href={href || '#'} target="_blank" rel="noreferrer"
                    className="w-10 h-10 rounded-xl bg-white/10 hover:bg-[#B59441] flex items-center justify-center text-white/70 hover:text-white transition-all">
                    {icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-[0.3em] text-white/40 mb-6">Navigation</h4>
              <ul className="space-y-3.5">
                {navLinks.map(link => (
                  <li key={link.name}>
                    <a href={link.href} className="text-base text-white/70 hover:text-[#B59441] transition-colors font-medium">{link.name}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Contact */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-[0.3em] text-white/40 mb-6">Contact</h4>
              <ul className="space-y-4">
                {contactData?.[0]?.address && (
                  <li className="flex gap-3 text-base text-white/60 leading-relaxed">
                    <RiMapPinLine className="text-[#B59441] flex-shrink-0 mt-0.5" size={18} />
                    {contactData[0].address}
                  </li>
                )}
                {contactData?.[0]?.phone && (
                  <li className="flex gap-3 text-base text-white/60">
                    <RiPhoneLine className="text-[#B59441] flex-shrink-0 mt-0.5" size={18} />
                    {contactData[0].phone}
                  </li>
                )}
                {contactData?.[0]?.email && (
                  <li className="flex gap-3 text-base text-white/60">
                    <RiMailLine className="text-[#B59441] flex-shrink-0 mt-0.5" size={18} />
                    {contactData[0].email}
                  </li>
                )}
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-[0.3em] text-white/40 mb-6">Newsletter</h4>
              <p className="text-base text-white/60 leading-relaxed mb-5">
                Get exclusive offers & hotel updates delivered to your inbox.
              </p>
              {subscribed ? (
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-base">
                  <RiCheckLine size={20} /> Subscribed! Thank you.
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex flex-col gap-3">
                  <input
                    type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com" required
                    className="w-full bg-white/10 border border-white/15 text-white placeholder-white/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#B59441] transition-colors" />
                  <button type="submit"
                    className="w-full bg-[#B59441] hover:bg-[#9e7e35] transition-colors text-white font-semibold py-3 rounded-xl text-sm flex items-center justify-center gap-2">
                    <RiSendPlaneLine size={16} /> Subscribe
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-white/30 text-xs uppercase tracking-[0.2em]">
              © 2026 {homeData?.[0]?.hotel_name || 'The Elite Concierge'}. All Rights Reserved.
            </p>
            <div className="flex gap-8">
              {['Privacy Policy', 'Terms of Use', 'Cookies'].map(label => (
                <a key={label} href="#" className="text-white/30 text-xs uppercase tracking-[0.15em] hover:text-[#B59441] transition-colors">{label}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Home;
