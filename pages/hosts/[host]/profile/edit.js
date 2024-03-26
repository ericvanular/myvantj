import { useState, useRef, useEffect, useContext } from 'react'
import { useRouter } from 'next/navigation'
import API from '@/lib/api'
import Link from '@/components/Link'
import formatDate from '@/lib/utils/formatDate'
import fetchWithToken from '@/lib/utils/fetchWithToken'
import generateFileUrl from '@/lib/utils/generateFileUrl'
import useSWR from 'swr'
import { useSession, signIn, signOut } from 'next-auth/react'
import { SiteContext } from 'pages/_app'

import { Switch, Disclosure } from '@headlessui/react'
import { CountryDropdown, RegionDropdown, CountryRegionData } from 'react-country-region-selector'
import { validateEmail, validatePhoneNumber, formatPhoneNumber } from '@/lib/utils/utilsFunctions'
import {
  PlusCircleIcon,
  MinusCircleIcon,
  KeyIcon,
  XCircleIcon,
  ChevronRightIcon,
  UserMinusIcon,
  LockClosedIcon,
  ArrowPathIcon,
  ArrowLeftCircleIcon,
} from '@heroicons/react/24/outline'

// import Button from '@/components/ui/Button';
// import { getStripe } from '@/lib/utils/stripe-client'
// import { useRouter } from 'next/navigation';

export default function ProfileSettings() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const authenticated = status === 'authenticated'
  const { partyData } = useContext(SiteContext)

  const [companyView, setCompanyView] = useState(false)
  const [errors, setErrors] = useState([])
  const [companyUsers, setCompanyUsers] = useState([])
  const [user, setUser] = useState({})
  const [contactLoaded, setUserLoaded] = useState(false)
  const [address, setAddress] = useState({})
  const [emails, setEmails] = useState([])
  const [phones, setPhones] = useState([])
  const [partyRelationship, setPartyRelationship] = useState({})
  const [company, setCompany] = useState([])
  const [avatarUrl, setAvatarUrl] = useState('')
  const [avatarChanged, setAvatarChanged] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [openDeleteModal, setOpenDeleteModal] = useState(false)

  useEffect(() => {
    if (session?.accessToken) {
      getUserDetails()
    }
  }, [session?.accessToken])

  // const { data: userData, error: userError } = useSWR(
  //   [
  //     `${process.env.NEXT_PUBLIC_API}/api/user/profile`,
  //     'GET',
  //     session?.accessToken,
  //   ],
  //   ([url, method, token]) => fetchWithToken(url, method, token)
  // )

  // const { data: plansData, error: plansError } = useSWR(
  //   [
  //     `${process.env.NEXT_PUBLIC_API}/api/company/public_products/${partyData?.id}`,
  //     'GET',
  //     session?.accessToken,
  //   ],
  //   ([url, method, token]) => fetchWithToken(url, method, token)
  // )

  // const subscriptions = plansData?.subscriptions.slice(0, 1)

  const getUserDetails = async () => {
    // setMode('processing')
    const response = await fetchWithToken(
      `${process.env.NEXT_PUBLIC_API}/api/user/profile`,
      'GET',
      session?.accessToken
    )
    if (response.result) {
      setUser(response.user)
      // setUserCompanies(response.companies.map( company => ({ value: company.id, label: company.name }) ))
      // setCompany(response.companies)
      setAvatarUrl(response.avatar_url)
      // setPartyRelationship(response.contact_party_relationship)
      response.addresses.length && setAddress(response.addresses[0])
      response.phones.length && setPhones(response.phones)
      response.emails.length && setEmails(response.emails)
    } else if (response.error) {
      setErrors([response.error])
    }
  }

  const editUserProfile = async () => {
    setProcessing(true)
    // const newFiles = avatarChanged ? await avatarUploader.current.uploadFiles() : []
    try {
      const response = await fetchWithToken(
        `${process.env.NEXT_PUBLIC_API}/api/user/profile`,
        'PUT',
        session?.accessToken,
        {
          ...(!companyView ? { person_data: user } : { company_data: user }),
          // ...(newFiles.length && { new_files: newFiles }),
          ...(!!Object.keys(address).length && { address_data: address }),
          ...(emails.length && { emails_data: emails }),
          ...(phones.length && { phones_data: phones }),
          // ...(!(partyRelationship?.comment === null) && { party_relationship_data: partyRelationship }),
        }
      )
      if (response.result) {
        getUserDetails()
        setProcessing(false)
        router.push('/profile')
      } else {
        console.log(response)
        // setStatus(['failure', response.error])
      }
    } catch (error) {
      return alert(error)
    } finally {
      // console.log('')
    }
  }

  // const deleteUser = () => {
  //     setProcessing(true)
  //     const options = {
  //         method: 'delete',
  //         url: `/api/crm/${contactId}`,
  //     }
  //     API(options).then( data => {
  //         setProcessing(false)
  //         // queryClient.invalidateQueries({ queryKey: ['contacts'] })
  //         setRedirectUrl('/crm')
  //     }).catch(error => {
  //         setProcessing(false)
  //         setErrors([error])
  //     })
  // }

  const handleUserChange = (e) => {
    const { name, value } = e.target
    setUser((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  const handleEmailChange = (e, currentIndex) => {
    const { name, value } = e.target
    const updatedEmail = { ...emails[currentIndex], [name]: value }
    setEmails([...emails.slice(0, currentIndex), updatedEmail, ...emails.slice(currentIndex + 1)])
  }

  const handlePhoneChange = (e, currentIndex) => {
    const { name, value } = e.target
    const updatedPhone = { ...phones[currentIndex], [name]: formatPhoneNumber(value) }
    setPhones([...phones.slice(0, currentIndex), updatedPhone, ...phones.slice(currentIndex + 1)])
  }

  // const handleChangeSearchTerm = (e) => {
  //     setSearchTerm(e.target.value)
  // }

  const fetchCompanyUsers = (inputValue) => {
    const options = {
      method: 'get',
      url: `/api/crm/company-contacts?search=${inputValue}`,
    }
    API(options).then((data) =>
      setCompanyUsers(
        data.company_contacts.map((company) => ({
          value: company.company_id,
          label: company.company_name,
        }))
      )
    )
    return companyUsers
  }

  const loadOptions = (inputValue, callback) => {
    const requestResults = fetchCompanyUsers(inputValue)
    callback(requestResults)
  }

  const handleSelectCompany = (newValue) => {
    newValue
      ? setCompany((prevState) => ({ ...prevState, company_id: newValue.value }))
      : setCompany((prevState) => ({ ...prevState, company_id: '' }))
  }

  const NoOptionsMessage = (props) => {
    return <div className="text-gray-900 block px-4 py-2 text-md">Start typing to see options</div>
  }

  const handleAddressChange = (e) => {
    const { name, value } = e.target
    setAddress((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  const selectCountry = (value) => {
    setAddress((prevState) => ({
      ...prevState,
      country: value,
      region: '',
    }))
  }

  const selectRegion = (value) => {
    setAddress((prevState) => ({
      ...prevState,
      region: value,
    }))
  }

  const handlePartyRelationshipChange = (e) => {
    const { name, value } = e.target
    setPartyRelationship((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  // const progressBarPct = [email?.email, user?.fname, user?.lname, phone?.number, (avatarUrl || avatarChanged)].filter(Boolean).length * 100 / 6
  const displayName =
    user.fname && user.lname && !companyView
      ? user.fname + ' ' + user.lname
      : user.name && companyView
      ? user.name
      : 'User Details'

  const formValidation = {
    person_name: !companyView ? !!(user?.fname && user?.lname) : true,
    company_name: companyView ? !!user?.name : true,
    emails:
      emails.length > 1
        ? emails.map((email) => validateEmail(email.email))
        : emails[0]?.email
        ? [validateEmail(emails[0].email)]
        : [true],
    phones:
      phones.length > 1
        ? phones.map((phone) => validatePhoneNumber(phone.number))
        : phones[0]?.number
        ? [validatePhoneNumber(phones[0].number)]
        : [true],
  }

  function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
  }

  return (
    <>
      <div className="py-4 flex justify-center">
        <Link
          href="/profile"
          className={classNames(
            'w-full flex items-center justify-center py-2 px-4 border border-transparent shadow-sm text-xl font-medium rounded-md text-gray-800 bg-gray-100 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          )}
        >
          <ArrowLeftCircleIcon className="h-6 w-6 mr-4" />
          <div className="">View Profile</div>
        </Link>
      </div>
      <div className="flex-1 xl:overflow-y-auto">
        <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {/* <h1 className="text-3xl font-extrabold">Personal</h1> */}
          <div className="space-y-8 divide-y divide-y-blue-gray-200">
            <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-6 sm:gap-x-6">
              <div className="sm:col-span-6 flex items-center justify-between">
                <h2 className="text-xl font-medium">Edit Profile</h2>
                {/* <div className="relative">
                            <div className="overflow-hidden h-2 mb-4 text-s flex rounded bg-white border">
                                <div style={{ width: `${progressBarPct}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gray-500"></div>
                            </div>
                        </div> */}

                {/* <div className="flex items-center">
                            <p className={classNames(
                                    companyView ? 'text-gray-400' : 'text-black',
                                    'text-sm'
                                )}
                            >
                                Person
                            </p>
                            <Switch
                                checked={companyView}
                                onChange={setCompanyView}
                                className={classNames(
                                    companyView ? 'bg-emerald-800' : 'bg-gray-200',
                                    'mx-2 relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-gray-600'
                                )}
                            >
                                <span className="sr-only">Use setting</span>
                                <span
                                    aria-hidden="true"
                                    className={classNames(
                                    companyView ? 'translate-x-5' : 'translate-x-0',
                                    'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200'
                                    )}
                                />
                            </Switch>
                            <p className={classNames(
                                    companyView ? 'text-black' : 'text-gray-400',
                                    'text-sm'
                                )}
                            >
                                Company
                            </p>
                        </div> */}
              </div>
              {!companyView ? (
                <>
                  <div className="sm:col-span-3">
                    <label htmlFor="first-name" className="block text-md font-medium">
                      First Name
                    </label>
                    <input
                      required
                      value={user?.fname || ''}
                      onChange={(e) => handleUserChange(e)}
                      type="text"
                      name="fname"
                      id="fname"
                      autoComplete="given-name"
                      className="text-black my-1 block w-full border-blue-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label htmlFor="last-name" className="block text-md font-medium">
                      Last Name
                    </label>
                    <input
                      required
                      value={user?.lname || ''}
                      onChange={(e) => handleUserChange(e)}
                      type="text"
                      name="lname"
                      id="lname"
                      autoComplete="family-name"
                      className="text-black my-1 block w-full border-blue-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </>
              ) : (
                <div className="sm:col-span-6">
                  <label htmlFor="name" className="block text-md font-medium">
                    Company Name
                  </label>
                  <input
                    required
                    value={user?.name || ''}
                    onChange={(e) => handleUserChange(e)}
                    type="text"
                    name="name"
                    id="name"
                    autoComplete="name"
                    className="text-black my-1 block w-full border-blue-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}
              {/* <div key={emails[0]?.id || 0} className="sm:col-span-6">
                        <label htmlFor="email" className="block text-md font-medium">
                            Email
                        </label>
                        <input
                            value={emails[0]?.email || ''}
                            onChange={(e) => handleEmailChange(e, 0)}
                            type="email"
                            name="email"
                            id="email"
                            autoComplete="email"
                            className={classNames(
                                formValidation.emails[0] ? 'border-blue-gray-300 focus:ring-blue-500 focus:border-blue-500' : 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500',
                                'my-1 block w-full rounded-md shadow-sm sm:text-sm focus:outline-none'
                            )}
                        />
                    </div>
                    { emails.slice(1).map((emailObj, idx) =>
                        <div key={emails[idx+1]?.id || idx} className="sm:col-span-6">
                            <div className="flex justify-between">
                                <label htmlFor="email" className="block text-md font-medium">
                                    {`Email ${idx+2}`}
                                </label>
                                <p
                                    onClick={() => setEmails([...emails.slice(0, idx+1), ...emails.slice(idx+2)])}
                                    className="flex items-center text-xs text-gray-400 hover:text-gray-600 hover:cursor-pointer" 
                                    id="email-remove"
                                >
                                    <MinusCircleIcon className="h-4 w-4 mr-1" />
                                    Remove email
                                </p>
                            </div>
                            <input
                                value={emails[idx+1]?.email || ''}
                                onChange={(e) => handleEmailChange(e, idx+1)}
                                type="email"
                                name="email"
                                id="email"
                                autoComplete="email"
                                className={classNames(
                                    formValidation.emails[idx+1] ? 'border-blue-gray-300 focus:ring-blue-500 focus:border-blue-500' : 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500',
                                    'my-1 block w-full rounded-md shadow-sm sm:text-sm focus:outline-none'
                                )}
                            />
                        </div>
                    )}
                    { emails.length < 3 &&
                        <p
                            onClick={() => {
                                if(emails.length === 0) setEmails([{email: ''}, {email: ''}])
                                else setEmails(prevState => [...prevState, {email: ''}])
                            }}
                            className="sm:col-span-6 -mt-6 flex items-center text-xs text-gray-400 hover:text-gray-600 hover:cursor-pointer" 
                            id="email-add"
                        >
                            <PlusCircleIcon className="h-4 w-4 mr-1" />
                            Add email
                        </p>
                    } */}
              <div key={phones[0]?.id || 80} className="sm:col-span-6">
                <label htmlFor="phone-number" className="block text-md font-medium">
                  Phone
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 flex items-center">
                    <label htmlFor="country" className="sr-only">
                      Country
                    </label>
                    <select
                      id="country"
                      name="country"
                      autoComplete="country"
                      className="focus:ring-indigo-500 focus:border-indigo-500 h-full py-0 pl-3 pr-7 border-transparent bg-transparent text-gray-500 sm:text-sm rounded-md"
                    >
                      <option>US</option>
                      {/* <option>CA</option> */}
                    </select>
                  </div>
                  <input
                    value={phones[0]?.number || ''}
                    onChange={(e) => handlePhoneChange(e, 0)}
                    type="text"
                    name="number"
                    id="phone-number"
                    autoComplete="phone"
                    className={classNames(
                      formValidation.phones[0]
                        ? 'border-blue-gray-300 focus:ring-blue-500 focus:border-blue-500'
                        : 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500',
                      'text-black pl-16 my-1 block w-full rounded-md shadow-sm sm:text-sm'
                    )}
                  />
                </div>
              </div>
              {/* { phones.slice(1).map((phoneObj, idx) =>
                        <div key={phones[idx+1]?.id || idx+80} className="sm:col-span-6">
                            <div className="flex justify-between">
                                <label htmlFor="phone-number" className="block text-md font-medium">
                                    {`Phone ${idx+2}`}
                                </label>
                                <p
                                    onClick={() => setPhones([...phones.slice(0, idx+1), ...phones.slice(idx+2)])}
                                    className="flex items-center text-xs text-gray-400 hover:text-gray-600 hover:cursor-pointer" 
                                    id="phone-remove"
                                >
                                    <MinusCircleIcon className="h-4 w-4 mr-1" />
                                    Remove phone
                                </p>
                            </div>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 flex items-center">
                                    <label htmlFor="country" className="sr-only">
                                        Country
                                    </label>
                                    <select
                                        id="country"
                                        name="country"
                                        autoComplete="country"
                                        className="focus:ring-indigo-500 focus:border-indigo-500 h-full py-0 pl-3 pr-7 border-transparent bg-transparent text-gray-500 sm:text-sm rounded-md"
                                    >
                                        <option>US</option>
                                        <option>CA</option>
                                    </select>
                                </div>
                                <input
                                    value={phones[idx+1]?.number || ''}
                                    onChange={(e) => handlePhoneChange(e, idx+1)}
                                    type="text"
                                    name="number"
                                    id="phone-number"
                                    autoComplete="phone"
                                    className={classNames(
                                        formValidation.phones[idx+1] ? 'border-blue-gray-300 focus:ring-blue-500 focus:border-blue-500' : 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500',
                                        'text-black pl-16 my-1 block w-full rounded-md shadow-sm sm:text-sm'
                                    )}
                                />
                            </div>
                        </div>
                    )}
                    { phones.length < 3 &&
                        <p
                            onClick={() => {
                                if(phones.length === 0) setPhones([{number: ''}, {number: ''}])
                                else setPhones(prevState => [...prevState, {number: ''}])
                            }}
                            className="sm:col-span-6 -mt-6 flex items-center text-xs text-gray-400 hover:text-gray-600 hover:cursor-pointer" 
                            id="phone-add"
                        >
                            <PlusCircleIcon className="h-4 w-4 mr-1" />
                            Add phone
                        </p>
                    } */}
              <div className="sm:col-span-3">
                <label htmlFor="country" className="block text-md font-medium">
                  Country
                </label>
                <CountryDropdown
                  value={address?.country}
                  onChange={selectCountry}
                  whitelist={['US', 'CA']}
                  classes="text-black my-1 block w-full border-blue-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500"
                  id="country"
                  name="country"
                  autoComplete="country"
                />
              </div>
              <div className="sm:col-span-3">
                <label htmlFor="state" className="block text-md font-medium">
                  State / Province
                </label>
                <RegionDropdown
                  country={address?.country}
                  value={address?.region}
                  onChange={selectRegion}
                  classes="text-black my-1 block w-full border-blue-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500"
                  id="region"
                  name="region"
                  autoComplete="region"
                />
              </div>
              <div className="sm:col-span-6">
                <label htmlFor="street-address" className="block text-md font-medium">
                  Street Address
                </label>
                <input
                  value={address?.address1 || ''}
                  onChange={(e) => handleAddressChange(e)}
                  type="text"
                  name="address1"
                  id="street_address"
                  autoComplete="street-address"
                  className="text-black my-1 block w-full border-blue-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="sm:col-span-3">
                <label htmlFor="city" className="block text-md font-medium">
                  City
                </label>
                <input
                  value={address?.city || ''}
                  onChange={(e) => handleAddressChange(e)}
                  type="text"
                  name="city"
                  id="city"
                  className="text-black my-1 block w-full border-blue-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="sm:col-span-3">
                <label htmlFor="postal-code" className="block text-md font-medium">
                  ZIP / Postal Code
                </label>
                <input
                  value={address?.postal_code || ''}
                  onChange={(e) => handleAddressChange(e)}
                  type="text"
                  name="postal_code"
                  id="postal_code"
                  autoComplete="postal-code"
                  className="text-black my-1 block w-full border-blue-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              {/* <div className="sm:col-span-6">
                        <label htmlFor="organization" className="block text-md font-medium">
                            Company Name
                        </label>
                        <AsyncCreatableSelect
                            name="company_id"
                            id="company_id"
                            defaultValue={{ label: company?.company_name, value: company?.company_id }}
                            isSearchable
                            isClearable
                            cacheOptions
                            defaultOptions                                
                            loadOptions={loadOptions}
                            onChange={handleSelectCompany}
                            components={{ NoOptionsMessage }}
                            className="my-1 block w-full border-blue-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div> */}
              {/* <div className="sm:col-span-6">
                        <label htmlFor="photo" className="block text-md font-medium">
                        User Photo
                        </label>
                        <div className="my-1 flex items-center justify-center">
                            <AvatarUploader 
                                ref={avatarUploader} 
                                setAvatarChanged={setAvatarChanged} 
                                avatarThumbnail={avatarUrl}
                            />
                        </div>
                    </div> */}
            </div>
          </div>
          <div className="pt-8 flex justify-center">
            <button
              onClick={() => editUserProfile()}
              className={classNames(
                formValidation.person_name &&
                  formValidation.company_name &&
                  formValidation.emails.every(Boolean) &&
                  formValidation.phones.every(Boolean)
                  ? ''
                  : 'pointer-events-none text-gray-400',
                'w-full flex items-center justify-center py-2 px-4 border border-transparent shadow-sm text-xl font-medium rounded-md text-white bg-gray-700 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              )}
            >
              {processing ? (
                <>
                  <ArrowPathIcon className="animate-spin h-6 w-6 mr-4" />
                  <div className="">Saving</div>
                </>
              ) : (
                <>
                  <LockClosedIcon className="h-6 w-6 mr-4" />
                  <div className="">Save</div>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
