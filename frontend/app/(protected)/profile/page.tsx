import { User, Package, MapPin, CreditCard, Shield } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const links = [
    { i: User, t: 'Account' },
    { i: Package, t: 'Orders' },
    { i: MapPin, t: 'Addresses' },
    { i: CreditCard, t: 'Payment' },
    { i: Shield, t: 'Change Password' },
  ];
  const orders = [
    { id: '#A1B2', date: '2026-04-12', total: '$1,299', status: 'Delivered' },
    { id: '#C3D4', date: '2026-03-28', total: '$149', status: 'Shipped' },
    { id: '#E5F6', date: '2026-03-02', total: '$89', status: 'Processing' },
  ];

  return (
    <div className='mx-auto max-w-7xl px-4 py-10'>
      <div className='font-pixel text-[10px] text-neon-cyan glow-cyan'>
        ▶ PROFILE
      </div>
      <h1 className='mt-2 font-pixel text-2xl'>PLAYER STATS</h1>

      <div className='mt-8 grid gap-6 lg:grid-cols-[260px_1fr]'>
        <aside className='h-fit border-[3px] border-foreground bg-card p-4 pixel-shadow'>
          <div className='flex items-center gap-3 border-b-[3px] border-foreground pb-4'>
            <span className='grid h-12 w-12 place-items-center bg-neon-pink pixel-border font-pixel text-sm text-background'>
              P1
            </span>
            <div>
              <div className='font-pixel text-[10px]'>PLAYER ONE</div>
              <div className='font-retro text-sm text-muted-foreground'>
                Lv. 42 · 2,400 XP
              </div>
            </div>
          </div>
          <ul className='mt-3 space-y-1'>
            {links.map(({ i: Icon, t }) => (
              <li key={t}>
                <a className='flex items-center gap-2 px-2 py-2 font-pixel text-[10px] hover:bg-neon-cyan hover:text-background'>
                  <Icon className='h-4 w-4' />
                  {t}
                </a>
              </li>
            ))}
          </ul>
        </aside>

        <div className='space-y-6'>
          <div className='border-[3px] border-foreground bg-card p-5 pixel-shadow'>
            <h3 className='font-pixel text-xs text-neon-cyan'>ACCOUNT INFO</h3>
            <div className='mt-4 grid gap-4 md:grid-cols-2'>
              <Field label='NAME' defaultValue='Player One' />
              <Field label='EMAIL' defaultValue='player1@pixel.gg' />
              <Field label='PHONE' defaultValue='+1 555 0100' />
              <Field label='DOB' defaultValue='1990-01-01' />
            </div>
          </div>

          <div className='border-[3px] border-foreground bg-card p-5 pixel-shadow'>
            <h3 className='font-pixel text-xs text-neon-pink'>RECENT ORDERS</h3>
            <table className='mt-4 w-full text-left'>
              <thead className='font-pixel text-[9px] text-muted-foreground'>
                <tr>
                  <th className='py-2'>ID</th>
                  <th>DATE</th>
                  <th>TOTAL</th>
                  <th>STATUS</th>
                  <th></th>
                </tr>
              </thead>
              <tbody className='font-retro text-base'>
                {orders.map((o) => (
                  <tr
                    key={o.id}
                    className='border-t-[3px] border-dashed border-foreground'
                  >
                    <td className='py-3 font-pixel text-[10px]'>{o.id}</td>
                    <td>{o.date}</td>
                    <td className='text-neon-green'>{o.total}</td>
                    <td>
                      <span className='border-2 border-foreground bg-background px-2 py-1 font-pixel text-[8px]'>
                        {o.status}
                      </span>
                    </td>
                    <td>
                      <Link
                        href='/profile'
                        className='font-pixel text-[9px] text-neon-cyan'
                      >
                        VIEW
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  ...rest
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className='block'>
      <span className='font-pixel text-[9px] text-muted-foreground'>
        {label}
      </span>
      <input
        {...rest}
        className='mt-2 h-11 w-full border-[3px] border-foreground bg-input px-3 font-retro text-lg outline-none focus:border-neon-cyan'
      />
    </label>
  );
}
