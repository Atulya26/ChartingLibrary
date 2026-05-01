import type { ReactNode } from 'react';
import { Button, EmptyState } from '@innovaccer/design-system';

import { ChartCard } from './ChartCard';
import { cx } from '../utils/cx';
import type { ChartStateCardProps, ChartStateVariant } from '../types';

const EMPTY_STATE_IMAGE_SRC =
  'data:image/png;base64,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';

const ERROR_STATE_IMAGE_SRC =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAH8AAABrCAYAAABe+l2eAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAOdEVYdFNvZnR3YXJlAEZpZ21hnrGWYwAAGslJREFUeAHtXW1vG1d2vjN8kUS9kZIlW5K9ljaWk1htI2NhoElarIwCRVF0Gxfodj/G/gVOfoHtX2DvL4j9qV8KxAGKflkUofthA2wKWMFGdhLbEW1Z75L5JomiSM7see7Mpa5GM8MZakiRSh6A4NuQQ85zzrnnnHvuuYz9jBOPdKEwnsvvfZnNF/XsVnE+nStew+sK+xknHiBeZ/qM/JrGtKsq+xknGum0HrcSD6iKMh1mP1E8nV8e1yv6NFPUcXp6XmdKXNF1PB53+EjKvM+QvcTjl4qmz3aGd2cnJiYyrLWB3xeXX9A0NfOTMPvz8/Px3XLntK4qHzGdEeHKNNP1OAsKipKh70uSUDyCQLw7OZJkLYR0dvcTVVXuVl8g4dVK0csnlnwQXtC6rhPZH9mRHVZVFo6EWDikslAoRGaQ8ftQyH4krFQ0877CyvRY13VWKlXYXrnCHx8ACQO99FBhlS8uXRh9yFoA6VzhOky9ppHV0jruJxLKydP8p8+WZ3RFuUUPZ+TXOyJhFiGyo9EIf6yqwf31UtkQiN3dPVYslauCwmEKgqprD1rNIpwI8rlZ12I3Sf8+ERquKAqLhkMs1hVlnR3RQMmuBZBf3CuznUKRC0MVZG7JStyZujByn7UA2pp8O9Kh1Z2dURbrbC7hToAgbO3sskKxtG8RWkQI2pJ8J9J7e7pYR7R1A5idwh7LbRdaRgjajvy558vXFUW9206kW2EnBIqqX313YiTFmoi2Id+Iy5XPmOnItSPpVhwSAl291xXevtOsvEFbkP/d/NpNTdNvQ9vhyPUR6T2xDnZUlMlL39ktsny+QI/LhtfOb/tOWmencZ6+nhgPDfk9OZJBIre1y/IkBBxNtAItTT4f2yuxu5SevI7nnR0RlujrrtuRKxDRa+sZlt/aYW8yW/x5PYgQ+Yl4LxugWyLRywXiqID2r6fzVStAQn773bdO3/HzHWlSDjVXvK6E1PfIl3iphbX7ia6ulNPxLUs+N/Oa8iUlacaPou0geGl5k8jO85sVERo+uigyQPyvUuIHNyR7ACR0NMqK4La3R9463RfIVOO5DHx+IN7HRkcGuUAcBQesAGMPu0KFG16GAczcqRWVXy/5dfpHt3t7I7ZC1DDyIYUJpD3rAE/UqOrnMPPIuA2Rdjll3pwAol/MLx0gHMT2dHeyWIwEqburatL9YpcEao/i93x+m20RUSUplocgvDU+yk4PJeoeHhAWZvM7hhXwOAxgqtZKvABm8BK9XUnr64GTv7W1d7Oi0/iMiQTkkEN0YhfTY8XT+bWP9Yp2H48Rq/f3xnyZ+cXlDfYitUQav8efg/ABEp7enm7WTYQ3AhCGzTfZA4IAIRg7c4qswSn+2C8ODAM1BCCfL80QwV86fpmuf9Hf13nN+nKg5BPx00T844MnUJJ9vdGrXj7PHbuKdg+Pe0lDYeq9Ahr+3bNXNJ4bJhPmHOPyqcE4F4BmIU2/I5PNse3tXf5cWIIxEgK/0CgvvEECgDkEQiasqVcvXhyetR6Xo7y9rqifOX2PEweBkp/NF2/T3S3r61o4OpHoUlJun336YvWWblgMX8TDO//z0xRb20jz5yB9eGiAE3+c2CYrsLbx5oAQXLn8Tl1WIJ3b5mEhcxCAdL4wQ2P78Wq+rQSSyerv6Zhw+1y9Gr+2nmbffpfiIRq0+9Rgv29NL5VKfIiAecVj+h3csROI8EkglTuEUZ469ucnwBKsrb+pDgcXyAq8NTHK/EIWACWkX7YOAa5jvq7cSPRF71tfD5R8VI2o4RJJoD5dPTHT7pCzcRuP+TRrpWNG0ZT96dWQel5oPEIorx79q9dr7OXrVf64mwTm7OgwERWp+Tl46m/SOVYs7rEsXVCr514LEISurg7yIWK+nEYIAIQVwGen3h7ns4x+kCMrUvUBKvq+B0/Pz5yKp9TIYW9fvv5WNMTbN+aO1XE6cRJepjm3fot+2CfsiABZLxdWuFkFRs4MssGBeM3PwBmDU7a9H0ZxGGRSqEeCI7RchHoAtwYI8eDh00yd7NkDYphBFFFL+HDu10tr/DvwuV+SFfAisJ5AAhANh5ODie5HITX0a13XshrTH9p5+fsfaQKevFh5zCtojghctB9Ti9WLd/7cGVfNA2kbm1m6ZaoaLsiG999PCSO/Fx/nLvCs4OEwL9Hfy4aHE67fieNfvlphu8UiD1/HyGL19XazoOAnOdRw8vlEDFM+Y0eETDwIP3/utOtF3iTSV8nUCtIxNIDwgURfoN5/joQgk8nR/U71NViCwYF+19zE8soGt0QAhqx4gA6qolNY6KFwpPGzIop6k1nLnHzCSjzMpROBOAamVZh3kD58aqBhMT60FjecF+O6cPDSJBBuUccI5QAgHPAD8HuBoARAV3R49slaxzWcfJLCQ+YeFwqSD83FmF3rNZhXaHAt4mVtxzG4wM0K+TAMwYSDcCGoi0QqSrvE/7ECxwIQgOXVDV6EUm/WUYauO1YgH8Cx1O1D0mEuN99kqhq6vLJefS1tpmQxVuM1kCkcJCfil1c2+QXEsTC571w8fyyxPn7n25PnidgEf47/8/2zl9xxtIMYIuDFw5F1Os4PFEXt93LcsZDfHeusPo6a8/GyxItEiLgQbsSD7PmXS/wiG9o+yDW+mVk9O4BUCAF+uzFsLTkSi9+LYYk7gwurBwtAG4hjqYTAhQHZISJIOG3ya7iH9gsnyikkAvG4qMite/H+mw1DaMeq3j1+q9N/+cXZM+z5jwv8v2AYcBoqgsSxqQecJKsTJl4TzhOAi+Dk1cvE46K2EvEC+G0T9NuEU+hkAeD8QXgh/PJw2Ei05Fq9tTUjHYox2ymBgzFeJj6wZEkDAGJ/QcQKwYYA2Jl2CC/yBAD8okab/5YjH+Y+nc2bmbOE7TEwi2KMb3XiZcC0d3Z0cAF49XrF9hgIuxAS/MdGomljPmWdPB33P//7mt9jksaOVGNMNIaE9381yUabMDYGiYmzA+zRH7/lZh1JHnj6VgyfSrB5zAqSkF/5mwkWkxxkN2Di5+USnz+YRkq9VgVQS2l+aoGSMzuGKbcz9yKvD0xdPNd2xAPdNHF15fIF/hg5jF2bOkJovhCKx3MpVgfiO+XOmvMoDSUfdXh+jn/ywwK/F8kPK5Cnhznsplm1S2+fY+2KIbJqF385wh8vr27aHoNrAOdvaeUNy2S3mV9Qjv9mrWMaSr5WUW95PVbWervkjBwBzHwwxdodl8hyQYiF+bcCTqJI96Zer7E6EH/yfPWa2wENJV9RDneEcALIB5y0HhEAMH5u2PMY2MqAkAvzD6G28+xRmAKkFtZZqVxm/qG7an/DyOdS5zHHDI1f38y5aj0iAGDq4ll2UgDzPzTYx4m38+xxPYTnP/9q3evX8qIYlLsTZuD4OR3XMPJpHu8jr8c++3GJ3/c4zLydNK2XMWX6LnamH4DnDyytbDKvULE83awSKpS7rjsexxoEOv81r8curRrkxvsPaz204iRqvcAQD2nD/H/aZfVEyhuWcWdn1/P3dotyOMVZCRtCPhZdYMFFxMOiBXiywtGzm3PHrB4A83jStF5g0vT8M9nDK4rg+PX1GZU+r1fSzCs6opGapr8h5FeMYgJPK2jXSKIBJ5MvLghM/knFxQmDfAi6neOHFUbA+maWeYVs+ncqnbZWuCHkK0ro17hHO5RaEH9I/EEZsikcJs1vFmCJ1jZy/GYt2GwEYPWE42eX9BGKsW4qileI668w3bZ+MvD07uP5dFypFPnJvGg+yqcBFFVaIS5EvSYf4aNIHAnMvD/l+F04Hs5nJrdz4HVYHfgbfn4DBOf/v3nm+dxDp/o5udB+6/AX4c2kjLoAjPtef8f+sKti3D+U8Qtc8zvLuwbxkdrE489AyzCuYcLDiu0dQ+vj/f6rW/G9IB738s0JX88+5zcr8QCEIvnVHL3nLdOG84B4r+cGhGXbLe7Zvi8KXNZ8aD+Uzxz3x+3G/cDJ11WFk+9lQULavNCdDkuYtk3vFh6xX8zOzde84AJzJCQiyeQEfFfyj3OePG4hdH4QN526XYeeAWKSy+/3hsMGxWhCaX0vePJ1xsd7L0uqxYUMqfaCUinzBYqUBvVn8kEmcuJewC3E9/tDA1KuMx/8Ffvtbz5g//wPvzrgaMJS/Ymsgxt++HG5piDZgUc7ZM7FsjErRKHKjk/yI+YCFJ0pjSdfMXu8RsK1zb6QYifNFyYw3u+984UdmW445BPQvMGQaYL5DNz0hepzwC3exrm/IYvj9dxWxEy/ByuDrIiaw+h2wXusD0TE8Kto49b3gvf2FUPCvGi+8KTtjhXvRSL+fNJHX31bfQytPV8jRFyULMTomQFbZ2rKMoPoFG/7PbcV4tx7NhEGFooCaOzoB6GQsS7Hrpw7ePLNFmlhD+TvmWZdVZ39g6iPxYyz3+6P89C6WhlBJJjkUM7JtxBZOIGszRTrnDTOezm3HaKmd65pFRYUxLpDRVHfs74XKPli/t5vCxU7oAcOEPNoOnmYNr9cfX7l8mTNkEgIn0Cizzmq6JZCUavpRd5dHmq8nNsOQsCCrN0LKc4r8gIlX2MVrvWq0tw+TyKsE0CVz1DASSGn4QfnnpWqbRpx7qNAUsRx63uBkq+WQ4GR72eMk8O6o1T57NUxZ/7EYu7bqcKo7XfaQNJDDuvgZMmhljUxA2cNXvwYOXdWb9wthpaTPyLphOPlc3k5N3wYp3mKbVPQg65GhvZjKMGwLHf0OFbyxcW3i2vFciu/SQ1r6GYFQrEq+XSP2FokkzB2i9o6GRAu2TGMO/gGXs4NOJFfzXvY+Ex+fSAvONbqXTGO2k2e4AKETAHwM4/tF+fPDVUfI4a3Jmjw22al2B1o1CSTuA5RmzkR0SfIb+jrhmPVfNF/x8m75UUOlOhBGtjJe0Z45OZgISO2LfkNOFbOGGI69Rll5cSFN/L722z09CCvm3vyw6sD1gcOnfxb3M6N7zwwXPTFXMkTx0bCh81+ydT87lhwmn+s5Peb5tOpBy5mt5DlczP9GH+RjnXCHIVgsjm2HgsypqfGOekCEAbcDv0ei0MHItzODSsif++HV95xFGJRno0JLjuzLya5Yl3+Q0ihXNYOXsGa/bCx/VjZY4crXDwxVem0dg3wU8RQDzAGQwDctBIa3siSceEcRh2mwUXK1y0X4RfH7u3DFGKsxWyWdR673iIGGQmaFxg/WzvNOvnLUb4CCFYik93iJhjCgN8H4ainkgjCLZ874lLfINLMvTbNmXiRh5jniPvr8C0pVcr6XqDkw6w8eb7iK0MFz9lLEcP6RpYXPPgFCPW6rEtM5AQFozTb229er5azHTbrclGLlwkzGWUX8hvh7acsJ3XF2IixSMOpiEHU8S+uepuibUfAN+DNpjo6bGN8UcRaT1GLphs8oC+f9b3g5/Mp4Yb7csnb5ESc98IL81o9O4shKlfrX7XS+hAmf9DBSgjyx077X5hqNm1GKX3K+l4DyNde4r7scWZKFC8C6FZtBbShnlUr7QJEMiJDaWvyi8Xq4tShU/7zCyUxeaWrKet7gZOvKsZJSiXv05IiqyY3MpQhVq08n19iJw0iDMXwZmfyNzcMa12PvwOI5JDC9EOt2qvkY5uO/Nbe3WyuOI8b9lzP5fauM5/Q1XIS96Wyd/LFfDlMv92qFWg+f5+05Aeb+LtdIc8NOHUh2TLj+8k6OnVr5n6/gF1HTk7+1lb5Y7WsztPBn5CIjOOGPdd1Rf8sly9+znxgj3WnsH8syNc07503xaoV0TffCrQoBaApJ2Xsr6X1aFEDk49h0U8pm0DV+irKrN37KjS+olfuO30B0XcNFoF5xOWJBLYT5yezq0VzAtKsQvvtJnqg/WLsn/t+gbU7oPG4ufce2l+gWg+KZkqY6ZVHdu+HQxX1Vi39hEVIp/U72HabeYCu648URZkp+ugmiYsA7UdFDDptoXuVFSPk7T7/8TVPvQ4Nxkljgst2NROF3VJV6516Dwmth6NXL/miFjDEQkm798M0LHhaTRuKlHDcfS/H0liSJIG6hV2i/EBMsiC0gQWwJn2Q7kVfPggHcubj42PVoo92wqtXS3y8R1Nop95DQuvrLQ4pmzt5A9HQTtLuGKSL4ixgwLl48mI1Q3G7r++WtR9j/4TN4k1cLEQFEI6FhWX211NvsXbCwuIa79WP/yr8GCvk3kN1a/1eVfGSTl25wmSj4aCNsxogvyDFfEDTKw9UptZsCmQFtP/lqzXXVmW4aOhsjbTn+to6pWQnWTsAFb4rKxv8sdO2MEH1Htoxt5ajEO+B0zEqEf+A1QJlh9y267BDSFcesjpg7VVj5/yJnrYo9kDm7+vZZ6zVwReNfi+6jSVsexEYvYQX+WNr3YAfYFZVmHwa8JNOx6laOXqP2aT+Dv4o9inzCR5X1rmjpmhVhnSvU6tS0dO2HQQAGi/m9UG8U9Op1bV0IK3mqvvxMuW+206cYXjw6XThaiis3kVYZ3k/Q6H6jURfR11arGva78nr99yOTQZalS0uv+FVODCVY2OHxz44gBCAeRIQCADmxNFnP6S2Tl3q4jKFdK+MXcDciMdGEWjKBKEOrG5A11yt+oEaa2zOxzRlWlWVOM0GpVil86HX8M4OWKvfUSnyrI3X9qsy4BH/4f++4dqAi+YUDx/ceClCgnK6YduqeAUcrqWl1WrG0m0fHRyDPQMAQX68jqINqf0qH6ovvXXGdT/Dhq+uoPl9nkaoh3wAVTxYGg3UEgB5bx2+28YkGio0vw07wtVXC6vVHULc9gGA04qhTWwjIzqJ1yMAMvnk6N1498LIfbfjW558AN0yxKoYNwEA5M0LUZyB4aNZ/XzQjQMFn6IwAz32z9Jw5bTrh0w8hBU7brymUDBjdh2HAKB4A7X+Xqp2q+R70HqgLRZtoMQKcwVI64owyEkAjB2t+sgKrPJ9bOFoIZsGIRhuUEcvK+kihncbemCh0EQaxKMFHYgHzpq+DQTgD4++qX4fagw9C7Hu7sALtM2KHZAHCAGAR+u0FQmPBM6PVbc5g+8gvG1cQCzFhiAcpQYehC+tbhpFJmYa1et+vnDusBkUIKyDjNPDAzwRVDF3CcP3y78/KLTVci0IAFasYAjgW5HQdKfb5oqYLcNN3tZcTKgAxmxZtzGlHA7zYcJqYiE4mB3L5LZ4NIESaxR3ygtNvG7YCC1HOCe3WkXZOnIZ4j8I57Ui7ShmCHE6cAFo2pj/9sRQYDtegRC+YUGh6GvLdFzYLJGY39qubm1eL3BerDsA6V4iC4zvr5fWqw4d8hiLy5vVKmGQDDrk7WLlXURkXwZFpnYCIDl8yUsXzlyt9ZuaQT72dZ85P5qoth0JAmJZttBiL/vYyuCbIxeK3HqAEGia00bJWESBtiiYROro6PC0abJ8HuTqha+CBM4HV97hFgfnSpIQCwEA7IgXqCUAS2s5ls0j2tF+f+nCaM3NFhpP/oulT5iu3kVPuPNjCealJasfIBJAaCWWZBlWoIe1wr47wucQAgVtx9AlDyuyAABOxAs4CUA2v0vkGyVfSkifcMvsCTRnF21T+/EY2h+0AGAhZ4riarETp9G6ve/YhMBKOnyCsZEhxxp+TGB992yhJvECsgC8M3mO9fTE2G7ROJeu63emJkduMw9oWguNb58v3atnls8PUOmKfWvk8RzDATJrjc74wWlLZ7YObNfu1R/ZpM9guxU/28TJAsCzh4k+OrF+59LkmXvMI5raPwVdIHkzQB01gmQJVOVjvN5HxIiuUUEARY+LSxsUju171biwPbEuLghdNO4G4XzyglOyOvAb5MJTkD1yeoANJryVWiNsffznZ+T579UtAJFo6NN/+6e/9Uw80NzmORbMvVh9jF22MQycSvQSIcH+HFxMlHtjO/PC7sEVQUil9lDCJ0wXu6vTWBmLm/WiiyllfB4kFck5LBT3uLOoSQtS8R9GKVEzPBRnA3Vs4Izv//rxd0cSABLo6//+L+/XnqI3cazko02IrilfwhLAFwhyBaoVb/g4nGG5rZ2qb3BUQIBOn4pzwvto3A0f0ZdptgAcK/mAIQDqY/Tva7QACJQpVQwhyNOtQLExHuM1pJCtvW/FhAwaH+PW1xvjlgLaHQ7YcQWaKQDHTj4wN782rWj6lxCAvh7Klh3zdOxxo1kC0BLkA7IANMsCtDKaIQAtQz4gCwAcqAGK08OhRqwibw9sUcj6JxIAt6yfHbwKQEtd2amJ4VlF1S5jPhrj70Y673md/0kD/v8WRRQoVBUNKjD3X/KwEEaueaCI5P5//fdXH9sd13JqhbSkoupXIQAIrXiLc5+dptsdW9jjh/43/j8Rn+zujF5mupIKWgBa0qZCAIpqx2XKWD3ASlO0Ysvmd3wt/GxH4P9h2jhbXaqOCZozV//x6uXZiqZcDVoAWmrMt8Pcs+XbogIYSZhB5OsbEGIdN1Bnn86ZW6spSkbXtU+nLDV4//n5V+MhlXwiRR8PwgdoefIBORmE54gGEA6eBGcQ2p6lPAPm4k0kaVbuhtOsXJAC0BbkC1itQK/ZO7cdAdLRtz+/XcRMHNd2rxMzQQiAoqhX24p8gFuBErstJoX4dqM0ZRpkQ+JG4hDpBly13Q71CsDi0hpPb9Op77Qd+QJPny9f12EFzKFACAGqbVpxOHAknebf7VqmeIFfAZBLxQk32pZ8AasQAPAJYpR/97KjZ6MBR26Lpn1xHxTpMrwKgIV4VomoE21PvgB27tYVFIvo1fWGsAYQgGYKAjScTxChYTQ5cRLhQGCky6glAFbiOSqRyyeGfAEzMoAA3GSW7cQgACjExPbiCBeDqB9ABrJcLnPNBulFax8ihc3qmv5FLLx7z6lJQhBwEgCZeFQziaKT//jXD5UTR74MzBUQO9coQsAunzPW9xVzm3HsCSSmZ4W/ILYko3i7mlwC0dBk0eJMPLdBEn2J6MseImXNmgSrAIjlX0LjUb2Ex3D2fvfRh7dPNPkyUEJWqMRmyN7RTX2Pb/5o7gF4JCBE09EAofKSRCbZFdpJNlLDa0EWALv3SSgf/O6jv7uOxz8Z8u0gagrJV4iThk8rih7XlRAvsaWxedw4irJtCssYr1WyTFFTSkXPaJHQbIxtp46TaCdwAQhrd5nGpslOPUAWX1X0DP2B2d/+5u+T4ri/AADhsX8GWlXHAAAAAElFTkSuQmCC';

const defaultsByVariant: Record<
  ChartStateVariant,
  {
    title: string;
    headline: string;
    description: string;
    primaryActionLabel?: string;
  }
> = {
  empty: {
    title: 'Chart',
    headline: 'No data to show',
    description: 'Try a different time range or adjust your filters.'
  },
  error: {
    title: 'Chart',
    headline: 'Couldn’t load this chart',
    description: 'Please try again. If the issue persists, contact support.',
    primaryActionLabel: 'Retry'
  }
};

function StateIllustration({ src, width }: { src: string; width: number }) {
  return (
    <EmptyState.Image
      src={src}
      alt=""
      width={width}
      height="107px"
      maxHeight="107px"
      className="cl-chart-state__illustration"
    />
  );
}

function resolveImage(
  variant: ChartStateVariant,
  imageNode: ReactNode,
  imageSrc: string | undefined
): ReactNode {
  if (imageNode) {
    return <EmptyState.Image>{imageNode}</EmptyState.Image>;
  }
  if (imageSrc) {
    return (
      <EmptyState.Image
        src={imageSrc}
        alt=""
        height="107px"
        maxHeight="107px"
        className="cl-chart-state__illustration"
      />
    );
  }
  return variant === 'empty' ? (
    <StateIllustration src={EMPTY_STATE_IMAGE_SRC} width={143} />
  ) : (
    <StateIllustration src={ERROR_STATE_IMAGE_SRC} width={127} />
  );
}

export function ChartStateCard({
  variant,
  title,
  headline,
  description,
  imageSrc,
  image,
  primaryActionLabel,
  onPrimaryAction,
  secondaryActionLabel,
  onSecondaryAction,
  width = 502,
  bodyHeight = 232,
  showCardBackground = true
}: ChartStateCardProps) {
  const defaults = defaultsByVariant[variant];
  const resolvedTitle = title ?? defaults.title;
  const resolvedHeadline = headline ?? defaults.headline;
  const resolvedDescription = description ?? defaults.description;
  const resolvedPrimary =
    primaryActionLabel === undefined ? defaults.primaryActionLabel : primaryActionLabel;
  const showActions = Boolean(resolvedPrimary || secondaryActionLabel);
  const illustration = resolveImage(variant, image, imageSrc);

  return (
    <ChartCard
      width={width}
      surface={showCardBackground ? 'card' : 'plain'}
      className={cx('cl-chart-card', 'cl-chart-state', `cl-chart-state--${variant}`)}
    >
      <figure className="cl-chart-shell" aria-label={`${resolvedTitle} — ${resolvedHeadline}`}>
        <h3 className="cl-header__title">{resolvedTitle}</h3>
        <div
          className="cl-chart-state__body"
          style={{ minHeight: bodyHeight }}
          role={variant === 'error' ? 'alert' : 'status'}
        >
          <EmptyState size="small" className="cl-chart-state__empty-state">
            {illustration}
            <EmptyState.Title>{resolvedHeadline}</EmptyState.Title>
            <EmptyState.Description>{resolvedDescription}</EmptyState.Description>
            {showActions ? (
              <EmptyState.Actions>
                {resolvedPrimary ? (
                  <Button
                    appearance={variant === 'error' ? 'primary' : 'basic'}
                    type="button"
                    size="tiny"
                    onClick={onPrimaryAction}
                  >
                    {resolvedPrimary}
                  </Button>
                ) : null}
                {secondaryActionLabel ? (
                  <Button
                    appearance="transparent"
                    type="button"
                    size="tiny"
                    onClick={onSecondaryAction}
                  >
                    {secondaryActionLabel}
                  </Button>
                ) : null}
              </EmptyState.Actions>
            ) : null}
          </EmptyState>
        </div>
      </figure>
    </ChartCard>
  );
}
