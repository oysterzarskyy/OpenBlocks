ver = "0.1.0a"

# if version is not equal to the version in the apk, return invalid.
#
# if apk doesn't match code, return invalid, its security ig
# but find apk first, then check version, then check code, then check sha, then check signature in release.
# note by dev

# randomize the version so it could be used as a key for the apk and exe

randomized_version = openssl rand -hex 32 -hmac $ver




openssl rand -hex 3128 -key $randomized_version # i dont know what this is but if we can we could import it into a file

