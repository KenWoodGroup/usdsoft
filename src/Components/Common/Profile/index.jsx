import { useGetLocationByIdQuery } from '@/store/services/location.api';
import { useGetUserByLocationIdQuery } from '@/store/services/user.api';
import Cookies from "js-cookie";
import {
    Building,
    MapPin,
    Phone,
    User,
    Calendar,
    Badge,
    Mail,
    Copy,
    ExternalLink,
    Key,
    Shield,
    Clock,
    Map,
    Layers,
    Building2,
    CreditCard
} from "lucide-react";
import { useEffect, useState } from "react";
import Loading from '../../Other/UI/Loadings/Loading';
import Error from '../../Other/UI/Error';
import UserEdit from './__components/UserEdit';
import EditPassword from './__components/EditPassword';
import { useTranslation } from 'react-i18next';

export default function Profile() {
    const { t } = useTranslation();
    const locationId = Cookies.get("location_id");
    const [isDarkMode, setIsDarkMode] = useState(false);

    const {
        data: location,
        isLoading: isLocationLoading,
        error: locationError,
    } = useGetLocationByIdQuery(locationId);

    const {
        data: users,
        isLoading: isUsersLoading,
        error: usersError,
        refetch: refetchUser
    } = useGetUserByLocationIdQuery(locationId);

    useEffect(() => {
        const darkMode = document.documentElement.classList.contains('dark');
        setIsDarkMode(darkMode);
    }, []);

    if (isLocationLoading || isUsersLoading) {
        return <Loading />;
    }

    if (locationError || usersError) {
        return <Error />;
    }

    const user = users?.[0];

    return (
        <div className="min-h-screen transition-colors duration-300 ">
            <div className="">
                <div className="mb-6">
                    <div className="flex items-center mb-4">
                        <Building2 className="h-10 w-10 mr-3 text-mainColor dark:text-blue-400" />
                        <h1 className="text-3xl md:text-4xl font-bold text-text-light dark:text-text-dark">
                            {t('profile.title')}
                        </h1>
                    </div>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        {t('profile.subtitle')}
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Карточка компании */}
                    <div className="rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-800 bg-card-light dark:bg-card-dark transition-all duration-300 hover:shadow-2xl">
                        <div className="flex items-center mb-8">
                            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800/30">
                                <Building className="h-10 w-10 text-mainColor dark:text-blue-400" />
                            </div>
                            <div className="ml-6">
                                <h2 className="text-2xl font-bold text-text-light dark:text-text-dark">
                                    {t('profile.companyCard.title')}
                                </h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    {t('profile.companyCard.subtitle')}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <InfoItem
                                icon={<Building className="h-5 w-5" />}
                                label={t('profile.companyCard.name')}
                                value={location?.name}
                                darkMode={isDarkMode}
                                highlight
                            />

                            <InfoItem
                                icon={<MapPin className="h-5 w-5" />}
                                label={t('profile.companyCard.address')}
                                value={location?.address}
                                darkMode={isDarkMode}
                                iconColor="text-green-600 dark:text-green-400"
                            />

                            <InfoItem
                                icon={<Phone className="h-5 w-5" />}
                                label={t('profile.companyCard.phone')}
                                value={location?.phone}
                                darkMode={isDarkMode}
                                link={`tel:${location?.phone}`}
                                iconColor="text-purple-600 dark:text-purple-400"
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-200 dark:border-gray-800">
                                <InfoItem
                                    icon={<CreditCard className="h-5 w-5" />}
                                    label={t('profile.companyCard.balance')}
                                    value={`${location?.balance} USD`}
                                    darkMode={isDarkMode}
                                    valueColor="text-emerald-600 dark:text-emerald-400"
                                />

                                <InfoItem
                                    icon={<Calendar className="h-5 w-5" />}
                                    label={t('profile.companyCard.registrationDate')}
                                    value={location?.createdAt ? new Date(location.createdAt).toLocaleDateString('ru-RU', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric'
                                    }) : t('profile.companyCard.notSpecified')}
                                    darkMode={isDarkMode}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Карточка пользователя */}
                    <div className="rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-800 bg-card-light dark:bg-card-dark transition-all duration-300 hover:shadow-2xl">
                        <div className="flex items-start justify-between">
                            <div className='flex items-center mb-8'>
                                <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/30 border border-purple-100 dark:border-purple-800/30">
                                    <User className="h-10 w-10 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div className="ml-6">
                                    <h2 className="text-2xl font-bold text-text-light dark:text-text-dark">
                                        {t('profile.userCard.title')}
                                    </h2>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        {t('profile.userCard.subtitle')}
                                    </p>
                                </div>
                            </div>
                            <div className='flex flex-col gap-[5px]'>
                                <UserEdit userData={user} refresh={refetchUser} />
                                <EditPassword userData={user} />
                            </div>
                        </div>
                        {user ? (
                            <div className="space-y-3">
                                <InfoItem
                                    icon={<User className="h-5 w-5" />}
                                    label={t('profile.userCard.fullName')}
                                    value={user.full_name}
                                    darkMode={isDarkMode}
                                    highlight
                                />

                                <InfoItem
                                    icon={<Key className="h-5 w-5" />}
                                    label={t('profile.userCard.username')}
                                    value={user.username}
                                    darkMode={isDarkMode}
                                    copyable
                                />

                                <InfoItem
                                    icon={<Mail className="h-5 w-5" />}
                                    label={t('profile.userCard.email')}
                                    value={user.email || t('profile.userCard.notSpecified')}
                                    darkMode={isDarkMode}
                                    link={user.email ? `mailto:${user.email}` : undefined}
                                    iconColor="text-amber-600 dark:text-amber-400"
                                />
                            </div>
                        ) : (
                            <div className="text-center py-10 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400">
                                <User className="h-16 w-16 mx-auto mb-4 opacity-50" />
                                <p className="text-xl font-medium mb-2">{t('profile.userCard.notFound.title')}</p>
                                <p className="text-sm opacity-75">{t('profile.userCard.notFound.description')}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function InfoItem({
    icon,
    label,
    value,
    darkMode,
    copyable = false,
    link,
    badge = false,
    badgeColor = "",
    iconColor = "",
    valueColor = "",
    highlight = false
}) {
    const { t } = useTranslation();

    const handleCopy = () => {
        navigator.clipboard.writeText(String(value));
    };

    const content = (
        <>
            <div className="p-3 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <div className={iconColor || "text-gray-600 dark:text-gray-300"}>
                    {icon}
                </div>
            </div>
            <div className="ml-4 flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    {label}
                </div>
                <div className={`mt-1 truncate ${badge ? '' : (highlight ? 'font-bold text-lg' : 'font-semibold')} ${valueColor || "text-text-light dark:text-text-dark"}`}>
                    {badge ? (
                        <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${badgeColor || "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300"}`}>
                            {value}
                        </span>
                    ) : (
                        <span className="block truncate">{value}</span>
                    )}
                </div>
            </div>
        </>
    );

    const containerClasses = `flex items-start p-3 rounded-xl transition-all duration-300 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 ${highlight ? 'border-2 border-mainColor/20' : ''}`;

    if (link) {
        return (
            <a
                href={link}
                className={`${containerClasses} group`}
                target={link.startsWith('http') ? '_blank' : undefined}
                rel={link.startsWith('http') ? 'noopener noreferrer' : undefined}
            >
                {content}
                <div className="ml-3 p-2 rounded-lg text-mainColor dark:text-blue-400 group-hover:bg-gray-100 dark:group-hover:bg-gray-700 transition-colors">
                    <ExternalLink className="h-4 w-4" />
                </div>
            </a>
        );
    }

    return (
        <div className={`${containerClasses} group`}>
            {content}
            {copyable && (
                <button
                    onClick={handleCopy}
                    className="ml-3 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
                    title={t('profile.userCard.copyTooltip')}
                >
                    <Copy className="h-4 w-4" />
                </button>
            )}
        </div>
    );
}