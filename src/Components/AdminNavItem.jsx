export const NavItem = ({ icon: Icon, text, active, redirect }) => {
  return (
    <>
      <a
        href={redirect}
        className={`flex items-center gap-3 w-full p-2 rounded-lg transition-colors ${
          active
            ? "bg-gray-800 text-white"
            : "hover:bg-gray-800 hover:text-white"
        }`}
      >
        <Icon className="h-5 w-5" />
        <span>{text}</span>
      </a>
    </>
  );
};
