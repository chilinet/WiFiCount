import { useState } from 'react';
import { DevicePhoneMobileIcon, DeviceTabletIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';

interface DevicePreviewProps {
    logoUrl?: string;
    welcomeHeading?: string;
    welcomeText?: string;
    hintText?: string;
    backgroundColor?: string;
    backgroundImage?: string;
    portalBackgroundColor?: string;
    buttonColor?: string;
    buttonText?: string;
    buttonUrl?: string;
    termsLinkText?: string;
    termsLinkUrl?: string;
    headingColor?: string;
    welcomeTextColor?: string;
    hintTextColor?: string;
    buttonTextColor?: string;
}

type DeviceType = 'mobile' | 'tablet' | 'desktop';

const deviceSizes = {
    mobile: { width: 375, height: 667 },
    tablet: { width: 768, height: 1024 },
    desktop: { width: 1920, height: 1080 }
};

export default function DevicePreview({
    logoUrl = 'https://chilinet.solutions/wp-content/uploads/2020/10/chilinetWhite.png',
    welcomeHeading = 'Willkommen im Gäste-WLAN',
    welcomeText = 'Sie sind nur noch einen Klick vom Internetzugang entfernt.',
    hintText = 'Mit der Nutzung des WLANs erklären Sie sich mit unseren Nutzungsbedingungen einverstanden.',
    backgroundColor = '#000000',
    backgroundImage = '',
    portalBackgroundColor = '#111111',
    buttonColor = '#ff9800',
    buttonText = 'Internet',
    buttonUrl = '#',
    termsLinkText = 'Nutzungsbedingungen anzeigen',
    termsLinkUrl = '#',
    headingColor = '#ffffff',
    welcomeTextColor = '#ffffff',
    hintTextColor = '#ffffff',
    buttonTextColor = '#000000'
}: DevicePreviewProps) {
    // Konvertiere relative Pfade zu absoluten URLs für Logo
    const getLogoUrl = () => {
        if (!logoUrl) return 'https://chilinet.solutions/wp-content/uploads/2020/10/chilinetWhite.png';
        if (logoUrl.startsWith('http://') || logoUrl.startsWith('https://') || logoUrl.startsWith('data:')) {
            return logoUrl;
        }
        if (logoUrl.startsWith('/uploads/')) {
            return `/api${logoUrl}`;
        }
        return logoUrl;
    };
    const [deviceType, setDeviceType] = useState<DeviceType>('mobile');

    const currentSize = deviceSizes[deviceType];
    const maxWidth = 800;
    const maxHeight = 600;
    const calculatedScale = Math.min(
        maxWidth / currentSize.width,
        maxHeight / currentSize.height,
        1
    );

    // Konvertiere Hex zu RGBA falls nötig, oder verwende direkt RGBA
    const getBackgroundColor = (color: string) => {
        if (!color) return '#000000';
        // Wenn bereits RGBA/RGB, verwende direkt
        if (color.startsWith('rgba') || color.startsWith('rgb')) {
            return color;
        }
        // Wenn Hex, konvertiere zu RGBA mit vollem Alpha
        if (color.startsWith('#')) {
            return color;
        }
        return color;
    };

    // Konvertiere relative Pfade zu absoluten URLs
    const getBackgroundImageUrl = () => {
        if (!backgroundImage) return '';
        if (backgroundImage.startsWith('http://') || backgroundImage.startsWith('https://') || backgroundImage.startsWith('data:')) {
            return backgroundImage;
        }
        if (backgroundImage.startsWith('/uploads/')) {
            return `/api${backgroundImage}`;
        }
        return backgroundImage;
    };

    const bodyStyle: React.CSSProperties = {
        background: backgroundImage 
            ? `url('${getBackgroundImageUrl()}') center/cover no-repeat, ${getBackgroundColor(backgroundColor)}`
            : getBackgroundColor(backgroundColor),
    };

    return (
        <div className="bg-gray-100 p-6 rounded-lg">
            {/* Device Type Selector */}
            <div className="flex justify-center gap-4 mb-4">
                <button
                    onClick={() => setDeviceType('mobile')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        deviceType === 'mobile'
                            ? 'bg-blue-500 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                >
                    <DevicePhoneMobileIcon className="h-5 w-5" />
                    <span>Mobile</span>
                </button>
                <button
                    onClick={() => setDeviceType('tablet')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        deviceType === 'tablet'
                            ? 'bg-blue-500 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                >
                    <DeviceTabletIcon className="h-5 w-5" />
                    <span>Tablet</span>
                </button>
                <button
                    onClick={() => setDeviceType('desktop')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        deviceType === 'desktop'
                            ? 'bg-blue-500 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                >
                    <ComputerDesktopIcon className="h-5 w-5" />
                    <span>Desktop</span>
                </button>
            </div>

            {/* Device Frame */}
            <div className="flex justify-center">
                <div
                    className="relative bg-gray-800 rounded-lg shadow-2xl p-2"
                    style={{
                        width: currentSize.width * calculatedScale + 16,
                        height: currentSize.height * calculatedScale + 16
                    }}
                >
                    {/* Device Screen */}
                    <div
                        className="rounded overflow-hidden relative flex items-center justify-center"
                        style={{
                            width: currentSize.width * calculatedScale,
                            height: currentSize.height * calculatedScale,
                            ...bodyStyle
                        }}
                    >
                        {/* Portal Content */}
                        <div 
                            className="text-center rounded-[18px] shadow-[0_16px_36px_rgba(0,0,0,.6)]"
                            style={{
                                width: 'min(95%, 480px)',
                                padding: '28px 22px',
                                backgroundColor: portalBackgroundColor?.startsWith('rgba') || portalBackgroundColor?.startsWith('rgb') 
                                    ? portalBackgroundColor 
                                    : portalBackgroundColor || '#111111'
                            }}
                        >
                            {/* Logo */}
                            {logoUrl && (
                                <div className="logo mb-4">
                                    <img
                                        src={getLogoUrl()}
                                        alt="Logo"
                                        className="max-w-[240px] w-full h-auto mx-auto"
                                    />
                                </div>
                            )}

                            {/* Welcome Heading */}
                            {welcomeHeading && (
                                <h1 
                                    className="m-[14px_0_8px] font-normal"
                                    style={{
                                        fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)',
                                        color: headingColor || '#ffffff'
                                    }}
                                >
                                    {welcomeHeading}
                                </h1>
                            )}

                            {/* Welcome Text */}
                            {welcomeText && (
                                <p 
                                    className="m-[6px_0] leading-[1.45]"
                                    style={{
                                        fontSize: 'clamp(.9rem, 2vw, 1rem)',
                                        color: welcomeTextColor || '#ffffff'
                                    }}
                                >
                                    {welcomeText}
                                </p>
                            )}

                            {/* Hint Text */}
                            {hintText && (
                                <p 
                                    className="hint m-[6px_0_18px]"
                                    style={{
                                        fontSize: 'clamp(.9rem, 2vw, 1rem)',
                                        color: hintTextColor || '#ffffff'
                                    }}
                                >
                                    {hintText}
                                </p>
                            )}

                            {/* Internet Button */}
                            {buttonText && (
                                <form method="post" action={buttonUrl}>
                                    <button
                                        type="submit"
                                        className="btn-main w-full py-[14px] px-4 rounded-full border-none font-bold text-base cursor-pointer shadow-[0_10px_20px_rgba(0,0,0,.7)] transition-all duration-100 active:scale-[0.98]"
                                        style={{
                                            backgroundColor: buttonColor,
                                            color: buttonTextColor || '#000000',
                                            filter: 'brightness(1)'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.filter = 'brightness(0.95)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.filter = 'brightness(1)';
                                        }}
                                    >
                                        {buttonText}
                                    </button>
                                </form>
                            )}

                            {/* Terms Link */}
                            {termsLinkText && (
                                <div className="terms mt-[18px] text-[.9rem]">
                                    <a
                                        href={termsLinkUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="no-underline hover:underline"
                                        style={{
                                            color: welcomeTextColor || '#ffffff',
                                            opacity: 0.8
                                        }}
                                    >
                                        {termsLinkText}
                                    </a>
                                </div>
                            )}

                            {/* Footer */}
                            <div className="mt-6 pt-4 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                                <p 
                                    className="text-xs text-center"
                                    style={{
                                        color: welcomeTextColor || '#ffffff',
                                        opacity: 0.6
                                    }}
                                >
                                    Chilinet Made with ❤️ in Germany
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Device Info */}
            <div className="text-center mt-4 text-sm text-gray-600">
                {deviceType === 'mobile' && `${currentSize.width} × ${currentSize.height}px (iPhone)`}
                {deviceType === 'tablet' && `${currentSize.width} × ${currentSize.height}px (iPad)`}
                {deviceType === 'desktop' && `${currentSize.width} × ${currentSize.height}px (Desktop)`}
            </div>
        </div>
    );
}

